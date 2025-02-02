// keyestudio Infrared Wireless Module Kit for microbit
// (receiver module+remote controller)
// author: jieliang mo
// github:https://github.com/mworkfun
// Write the date: 2020-5-15

enum state {
        state1=0x10,
        state2=0x11,
        state3=0x20,
        state4=0x21
    }
interface KV {
    key: state;
    action: Action;
}

const enum irPins{
  //% block="0"
  P0=  0,
  //% block="1"
  P1=  1,
  //% block="2"
  P2=  2,
  //% block="3"
  P3=  3,
  //% block="4"
  P4=  4,
  //% block="5"
  P5=  5,
  //% block="6"
  P6=  6,
  //% block="7"
  P7=  7,
  //% block="8"
  P8=  8,
  //% block="9"
  P9=  9,
  //% block="10"
  P10= 10,
  //% block="11"
  P11= 11,
  //% block="12"
  P12= 12,
  //% block="13"
  P13= 13,
  //% block="14"
  P14= 14,
  //% block="15"
  P15= 15,
  //% block="16"
  P16= 16
}

const enum IrButton {
    //% block=" "
    Any = -1,
    //% block="▲"
    Up = 70,
    //% block=" "
    Unused_2 = -2,
    //% block="◀"
    Left = 68,
    //% block="OK"
    Ok = 64,
    //% block="▶"
    Right = 67,
    //% block=" "
    Unused_3 = -3,
    //% block="▼"
    Down = 21,
    //% block=" "
    Unused_4 = -4,
    //% block="1"
    Number_1 = 22,
    //% block="2"
    Number_2 = 25,
    //% block="3"
    Number_3 = 13,
    //% block="4"
    Number_4 = 12,
    //% block="5"
    Number_5 = 24,
    //% block="6"
    Number_6 = 94,
    //% block="7"
    Number_7 = 8,
    //% block="8"
    Number_8 = 28,
    //% block="9"
    Number_9 = 90,
    //% block="*"
    Star = 66,
    //% block="0"
    Number_0 = 82,
    //% block="#"
    Hash = 74
}
/**
 * create IR_receiver namespace
 * use for keyestudio IR receiver and IR emission kit
 * author: jieliang mo
 * Write the date: 2020-5-15
 */
//% color="#ff6800" weight=10 icon="\uf1eb"
namespace irReceiver {
    /**
     * define a IR receiver class
     */
    class irReceiver {
        constructor() {
            this.address = 0;
            this.command = 0;
        }
        address: number;
        command: number;
        IR_pin: DigitalPin;
    }
    //create a IR receiver class
    let IR_R = new irReceiver;

    //define nec_IR maximum number of pulses is 33.
    //create 2 pulse cache array.
    let maxPulse: number = 33;
    let low_pulse: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let high_pulse: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    //must define for 33,
    //otherwise there is a risk of error in receiving the first data.
    let LpulseCounter: number = 33;
    let HpulseCounter: number = 33;

    let LpulseTime: number = 0;
    let HpulseTime: number = 0;
    //let pulse9ms: boolean = false;
    //let pulse4ms: boolean = false;
    //This variable will become true when the pulse is repeated
    //let repeatedPulse: boolean = false;

    /**
     * initialize the IR receiver function
     */
    function irInit(IR_pin: DigitalPin) {
        pins.onPulsed(IR_pin, PulseValue.Low, () => {      //interrupt event
            LpulseTime = pins.pulseDuration();             //measure the pulse
            if (8250 < LpulseTime && LpulseTime < 9250) {  //9ms
                LpulseCounter = 0;
            }
            if (LpulseCounter < maxPulse /*&& repeatedPulse == false*/) {
                low_pulse[LpulseCounter] = LpulseTime;
                LpulseCounter += 1;
            }
        });
        pins.onPulsed(IR_pin, PulseValue.High, () => {
            HpulseTime = pins.pulseDuration();
            /*if (2000 < HpulseTime && HpulseTime < 2500) {  //2.25ms
                repeatedPulse = true;
            }*/
            if (4250 < HpulseTime && HpulseTime < 4750) {  //4.5ms
                HpulseCounter = 0;
                //repeatedPulse = false;
            }
            if (HpulseCounter < maxPulse /*&& repeatedPulse == false*/) {
                high_pulse[HpulseCounter] = HpulseTime;
                HpulseCounter += 1;
            }
        });
    }
    /**
    * Convert the pulse into data function
    * author: jieliang mo
    * github:https://github.com/mworkfun
    * Write the date: 2020-5-15
    */
    function irDataProcessing() {
        let tempAddress: number = 0;
        let inverseAddress: number = 0;
        let tempCommand: number = 0;
        let inverseCommand: number = 0;
        let num: number;
        //confirm start pulse
        if (8250 < low_pulse[0] && low_pulse[0] < 9250 && HpulseCounter >= 33) {
            //conver the pulse into data
            for (num = 1; num < maxPulse; num++) {
                //if (440 < low_pulse[num] && low_pulse[num] < 680) {      //0.56ms
                if (1400 < high_pulse[num] && high_pulse[num] < 2000) {  //1.69ms = 1, 0.56ms = 0
                    if (1 <= num && num < 9) {    //conver the pulse into address
                        tempAddress |= 1 << (num - 1);
                    }
                    if (9 <= num && num < 17) {   //conver the pulse into inverse address
                        inverseAddress |= 1 << (num - 9);
                    }
                    if (17 <= num && num < 25) {   //conver the pulse into command
                        tempCommand |= 1 << (num - 17);
                    }
                    if (25 <= num && num < 33) {   //conver the pulse into inverse command
                        inverseCommand |= 1 << (num - 25);
                    }
                }
                //}
            }
            low_pulse[0] = 0;
            //check the data and return the data to IR receiver class.
            if ((tempAddress + inverseAddress == 0xff) && (tempCommand + inverseCommand == 0xff)) {
                IR_R.address = tempAddress;
                IR_R.command = tempCommand;
                return;
            } else {  //Return -1 if check error.
                IR_R.address = -1;
                IR_R.command = -1;
                return;
            }
        }
        IR_R.address = 0;
        IR_R.command = 0;
    }
    /**
     * Connects to the IR receiver module at the specified pin.
     * author: jieliang mo
     * github:https://github.com/mworkfun
     * Write the date: 2020-5-15
     */
    //% subcategory="IR Remote V1"
    //% blockId="infrared_connect"
    //% block="connect IR receiver at %IR_pin"
    //% IR_pin.fieldEditor="gridpicker"
    //% IR_pin.fieldOptions.columns=4
    //% IR_pin.fieldOptions.tooltips="false"
    //% weight=99
    export function connectInfrared(IR_pin: DigitalPin): void {
        IR_R.IR_pin = IR_pin;   //define IR receiver control pin
        pins.setPull(IR_R.IR_pin, PinPullMode.PullUp);
        irInit(IR_R.IR_pin);   //initialize the IR receiver
    }
    /**
     * Returns the command code of a specific IR button.
     * author: jieliang mo
     * github:https://github.com/mworkfun
     * Write the date: 2020-5-15
     */
    //% subcategory="IR Remote V1"
    //% blockId=infrared_button
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.columns=3
    //% button.fieldOptions.tooltips="false"
    //% block="IR button %button"
    //% weight=98
    export function irButton(button: IrButton): number {
        return button as number;
    }
    /**
     * Returns the code of the IR button that is currently pressed and 0 if no button is pressed.
     * It is recommended to delay 110ms to read the data once
     * author: jieliang mo
     * github:https://github.com/mworkfun
     * Write the date: 2020-5-18
     */
    //% subcategory="IR Remote V1"
    //% blockId=infrared_pressed_button
    //% block="IR button"
    //% weight=97
    export function returnIrButton(): number {
        irDataProcessing();
        return IR_R.command;
    }



    let irstate:number;
    let state:number;

    let ir_code = 0x00;
    let ir_addr = 0x00;
    let data;
    
    //% blockId=logic_v2 block="%IR_pin"
    function logic_value(IR_pin: DigitalPin){//判断逻辑值"0"和"1"子函数
        let low_time = pins.pulseIn(IR_pin, PulseValue.Low);  //获取低电平时间
        if(low_time > 400 && low_time < 700){//低电平时间范围560us
            let lasttime = pins.pulseIn(IR_pin, PulseValue.Low);  //获取高电平时间
            if(lasttime > 400 && lasttime < 700){//接着高电平560us
                return 0;
            }else if(lasttime>1500 && lasttime < 1800){//接着高电平1.7ms
                return 1;
           }
        }
        //serial.writeNumber(IR_pin);
        serial.writeLine("error");
        return -1;
    }

    
    //% blockId=IR_readv2_remote block="%IR_pin"
    function remote_decode(IR_pin: DigitalPin){
        data = 0x00;
        let nowtime = pins.pulseIn(IR_pin, PulseValue.High);
        serial.writeNumber(nowtime);
        if(nowtime > 100000){//超过100 ms,表明此时没有按键按下
            ir_code = 0xff00;
            return;
        }

        //如果高电平持续时间不超过100ms
        let low_time = pins.pulseIn(IR_pin, PulseValue.Low);
        if(low_time < 10000 && low_time > 8000){//9ms
            let high_time = pins.pulseIn(IR_pin, PulseValue.High);
            if(high_time > 4000 && high_time < 5000){//4.5ms,接收到了红外协议头且是新发送的数据。开始解析逻辑0和1
                //pulse_deal(IR_pin);
                let i;
                ir_addr=0x00;//清零
                for(i=0; i<16;i++ )
                {
                  if(logic_value(IR_pin) == 1)
                  {
                    ir_addr |=(1<<i);
                  }
                }
                //解析遥控器编码中的command指令
                ir_code=0x00;//清零
                for(i=0; i<16;i++ )
                {
                  if(logic_value(IR_pin) == 1)
                  {
                    ir_code |=(1<<i);
                  }
                }
                //uBit.serial.printf("addr=0x%X,code = 0x%X\r\n",ir_addr,ir_code);
                data = ir_code;
                return;//ir_code;
            }
            else if(high_time > 2000 && high_time < 2500){//2.25ms,表示发的跟上一个包一致
                low_time = pins.pulseIn(IR_pin, PulseValue.Low);//低等待
                if(low_time > 500 && low_time < 700){//560us
                    //uBit.serial.printf("addr=0x%X,code = 0x%X\r\n",ir_addr,ir_code);
                    data = ir_code;
                    return;//ir_code;
                }
            }
        }
    }
    
    //% blockId=IR_readv2_code block="%IR_pin"
    function irCode(IR_pin: DigitalPin): number {
        //serial.writeNumber(IR_pin);
        remote_decode(IR_pin);
        return 0;
    }

      
    //% subcategory="IR Remote V2"
    //% IR_pin.fieldEditor="gridpicker"
    //% IR_pin.fieldOptions.columns=4
    //% IR_pin.fieldOptions.tooltips="false"
    //% weight=5
    //% group="micro:bit(v2)"
    //% blockId=IR_readv2 block="V2 IR receiver at %IR_pin"
    export function IR_readV2(IR_pin: DigitalPin): number {
        let irdata:number;
        switch(irCode(IR_pin)){
            case 0xb946:irdata = 12;break;
            case 0xbb44:irdata = 13;break;
            case 0xea15:irdata = 14;break;
            case 0xbc43:irdata = 15;break;
            case 0xbf40:irdata = 16;break;
            case 0xad52:irdata = 0;break;
            case 0xe916:irdata = 1;break;
            case 0xe619:irdata = 2;break;
            case 0xf20d:irdata = 3;break;
            case 0xf30C:irdata = 4;break;
            case 0xe718:irdata = 5;break;
            case 0xa15e:irdata = 6;break;
            case 0xf708:irdata = 7;break;
            case 0xe31c:irdata = 8;break;
            case 0xa55a:irdata = 9;break;
            case 0xbd42:irdata = 10;break;
            case 0xb54a:irdata = 11;break;
            default:
            irdata = -1;
        }
        return irdata;
        //return irCode();
    }

    //% subcategory="IR Remote V2"
    //% weight=2
    //% group="micro:bit(v2)"
    //% blockId=IR_callbackUserv2 block="on IR  received"
    //% draggableParameters
    export function IR_callbackUserV2(cb: (message: number) => void) {
        state = 1;
        control.onEvent(11, 22, function() {
            cb(irstate)
        }) 
    }
    
    let irPins:number;
    function valuotokeyConversion():number{
        let irdata:number;
        switch(irCode(irPins)){
            case 0xb946:irdata = 12;break;
            case 0xbb44:irdata = 13;break;
            case 0xea15:irdata = 14;break;
            case 0xbc43:irdata = 15;break;
            case 0xbf40:irdata = 16;break;
            case 0xad52:irdata = 0;break;
            case 0xe916:irdata = 1;break;
            case 0xe619:irdata = 2;break;
            case 0xf20d:irdata = 3;break;
            case 0xf30C:irdata = 4;break;
            case 0xe718:irdata = 5;break;
            case 0xa15e:irdata = 6;break;
            case 0xf708:irdata = 7;break;
            case 0xe31c:irdata = 8;break;
            case 0xa55a:irdata = 9;break;
            case 0xbd42:irdata = 10;break;
            case 0xb54a:irdata = 11;break;
            default:
            irdata = -1;
        }
        return irdata;
        //return irCode();
    }
    basic.forever(() => {
        if(state == 1){
            irstate = valuotokeyConversion();
            if(irstate != -1){
                control.raiseEvent(11, 22)
            }
        }
        
        basic.pause(20);
    })

}

