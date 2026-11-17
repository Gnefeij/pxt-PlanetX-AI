/* Run with TypeScript 5.x available: NODE_PATH=... node tests/assistant.test.js */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const ts = require('typescript');
const source = fs.readFileSync(require('path').join(__dirname, '../main.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES5 }, reportDiagnostics: true });
assert.strictEqual(compiled.diagnostics.length, 0);
function crc8(bytes) { let crc=0; for (const byte of bytes) { crc^=byte; for(let b=0;b<8;b++) crc=((crc<<1)^((crc&128)?7:0))&255; } return crc; }
function crc32(bytes) { let crc=0xffffffff; for(const byte of bytes) {crc^=byte;for(let b=0;b<8;b++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0; }

function simulation(duplicate=false, staleAck=false, sessionValue=123, eventStart=0) {
    let now=0, readAddress=0, readLength=0, callbacks=0, ignoreAck=true;
    let session=0, revision=0, ready=false, request=0, event=0, reports=0;
    const mailbox=Buffer.alloc(64), chunks=new Map(), tasks=[], handlers=new Map(), frames=[];
    const stopped = new Error('end simulation');
    function update() {
        mailbox.fill(0);mailbox.write('AI');mailbox[2]=1;mailbox.writeUInt32LE(request,4);
        if(staleAck)mailbox.writeUInt32LE(request-1,4);
        mailbox.writeUInt32LE(session,8);mailbox.writeUInt32LE(revision,12);
        mailbox.writeUInt32LE(event,16);mailbox.writeUInt16LE(event?7:0,20);
        mailbox[22]=event?1:0;mailbox[23]=ready?1:0;mailbox.writeUInt32LE(0xcb49d566,24);
        mailbox.writeUInt32LE(crc32(mailbox.subarray(0,60)),60);
    }
    const math=Object.create(Math);math.randomRange=()=>sessionValue;
    const context={Buffer,console,NumberFormat:{},Math:math,
        pins:{createBuffer:n=>Buffer.alloc(n),i2cWriteBuffer:(address,packet)=>{
            frames.push(Buffer.from(packet));assert(packet.length<=50,'MCU I2C buffer overflow');
            assert.strictEqual(packet[packet.length-1],crc8(packet.subarray(0,-1)));
            const parameters=packet.subarray(3,-1);
            if(packet[1]===0x21){readAddress=parameters.readUInt16BE(0);readLength=parameters.readUInt16BE(2);return;}
            assert.strictEqual(packet[1],0x30);
            const uart=parameters.subarray(2);assert.strictEqual(parameters.readUInt16BE(0),uart.length);
            assert.strictEqual(uart[2],0x49);const payload=uart.subarray(4);
            assert.strictEqual(uart[3],payload.length);
            const operation=payload[1], seq=payload.readUInt32LE(2);
            if(operation===6){
                reports++;
                assert.strictEqual(payload.length,38);
                assert.strictEqual(payload.subarray(14,16).toString(),'AI');
                assert.strictEqual(payload.readUInt32LE(18),seq-1);
                staleAck=false;update();return;
            }
            session=payload.readUInt32LE(6);revision=payload.readUInt32LE(10);
            if(operation===4 && ignoreAck){ignoreAck=false;return;}
            request=seq;
            if(operation===1){ready=false;}
            if(operation===2){
                const id=payload.readUInt16LE(14),total=payload[16],offset=payload[17];
                if(!chunks.has(id)) chunks.set(id,Buffer.alloc(total));
                payload.copy(chunks.get(id),offset,18);
            }
            if(operation===3){assert.strictEqual(payload[14],2);ready=true;event=eventStart+1;}
            if(operation===4){const acknowledged=payload.readUInt32LE(14);if(event===acknowledged)event=event===eventStart+1?eventStart+2:0;}
            update();
        },i2cReadBuffer:(address,length)=>{
            assert.strictEqual(length,readLength+1);const output=Buffer.alloc(length);
            mailbox.copy(output,0,readAddress-960,readAddress-960+readLength);
            output[length-1]=crc8(output.subarray(0,-1));return output;
        }},
        input:{runningTime:()=>++now},basic:{pause:ms=>{now+=ms;if(now>4500)throw stopped;}},
        control:{createBufferFromUTF8:text=>Buffer.from(text),inBackground:fn=>tasks.push(fn),onEvent:(source,id,handler)=>handlers.set(id,handler),
                 raiseEvent:(source,id)=>{assert.strictEqual(source,3510);handlers.get(id)();}}
    };
    vm.createContext(context);vm.runInContext(compiled.outputText,context);
    const api=context.PlanetX_AILens;
    const description='向前移动'.repeat(10); // 120 UTF-8 bytes, deliberately crosses chunk boundaries.
    api.onAssistantCommand(description,7,()=>callbacks++);
    api.onAssistantCommand(duplicate?'不同描述':'停止移动',duplicate?7:8,()=>{});
    assert.strictEqual(tasks.length,1,'one polling fiber per program');
    try{tasks[0]();}catch(error){if(error!==stopped)throw error;}
    if(duplicate){assert.strictEqual(api.assistantCommandsReady(),false);assert.strictEqual(frames.length,0);}
    else{
        assert.strictEqual(chunks.get(7).toString(),description);
        assert.strictEqual(chunks.get(8).toString(),'停止移动');
        assert.strictEqual(callbacks,2,'same command in distinct events fires twice; ACK retry does not repeat callback');
        assert.strictEqual(api.assistantCommandsReady(),true);
        return reports;
    }
}
simulation();simulation(true);
assert.strictEqual(simulation(false,true),2,'stale registration ACK and deliberately lost event ACK are reported before retries succeed');
simulation(false,false,1561532238,0x01000000);
simulation(false,false,0x7fffffff,0xffffff00);
console.log('MakeCode assistant registration, UTF-8 chunks, CRC, repeated events and conflicting IDs passed');
