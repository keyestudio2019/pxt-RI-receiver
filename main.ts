// MakerBit blocks supporting a Keyestudio Infrared Wireless Module Kit
// (receiver module+remote controller)

const enum IrButton {
    //% block="T"
    Any = -1,
    //% block="▲"
    Up = 0x62,
    //% block=" "
    Unused_2 = -2,
    //% block="◀"
    Left = 0x22,
    //% block="OK"
    Ok = 0x02,
    //% block="▶"
    Right = 0xc2,
    //% block=" "
    Unused_3 = -3,
    //% block="▼"
    Down = 0xa8,
    //% block=" "
    Unused_4 = -4,
    //% block="1"
    Number_1 = 0x68,
    //% block="2"
    Number_2 = 0x98,
    //% block="3"
    Number_3 = 0xb0,
    //% block="4"
    Number_4 = 0x30,
    //% block="5"
    Number_5 = 0x18,
    //% block="6"
    Number_6 = 0x7a,
    //% block="7"
    Number_7 = 0x10,
    //% block="8"
    Number_8 = 0x38,
    //% block="9"
    Number_9 = 0x5a,
    //% block="*"
    Star = 0x42,
    //% block="0"
    Number_0 = 0x4a,
    //% block="#"
    Hash = 0x52
}

const enum IrButtonAction {
    //% block="pressed"
    Pressed = 0,
    //% block="released"
    Released = 1
}

//% color="#ff6800" weight=10 icon="\uf1eb"
namespace IR_receiver {
    /**
     * define a IR receiver class
     */
    class IR_rec {
        constructor() {
            this.address = 0;
            this.command = 0;
        }
        address: number;  
        command: number;
        IR_pin: DigitalPin;
    }
    //create a IR receiver class
    let IR_R = new IR_rec;

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
    let pulse9ms: boolean = false;
    let pulse4ms: boolean = false;
    //This variable will become true when the pulse is repeated
    let repeatedPulse: boolean = false;

    /**
     * initialize the IR receiver function
     */
    function IR_init(IR_pin: DigitalPin) {
        pins.onPulsed(IR_pin, PulseValue.Low, () => { //interrupt event
            LpulseTime = pins.pulseDuration();        //measure the pulse
            if (8250 < LpulseTime && LpulseTime < 9250) {  //9ms
                LpulseCounter = 0;
            }
            if (LpulseCounter < maxPulse && repeatedPulse == false) {
                low_pulse[LpulseCounter] = LpulseTime;
                LpulseCounter += 1;
            }
        });
        pins.onPulsed(IR_pin, PulseValue.High, () => {
            HpulseTime = pins.pulseDuration();
            if (4250 < HpulseTime && HpulseTime < 4750) {  //4.5ms
                HpulseCounter = 0;
                repeatedPulse = false;
            }
            if (2000 < HpulseTime && HpulseTime < 2500) {  //2.25ms
                repeatedPulse = true;
            }
            if (HpulseCounter < maxPulse && repeatedPulse == false) {
                high_pulse[HpulseCounter] = HpulseTime;
                HpulseCounter += 1;
            }
        });
    }
    /**
     * Convert the pulse into data function
     */
    function IR_data_processing() {
        let tempAddress: number = 0;
        let inverseAddress: number = 0;
        let tempCommand: number = 0;
        let inverseCommand: number = 0;
        let num: number;
        //confirm start pulse
        if (8250 < low_pulse[0] && low_pulse[0] < 9250 && 4250 < high_pulse[0] && high_pulse[0] < 5750) {
            //conver the pulse into data
            for (num = 1; num < maxPulse; num++) {
                if (460 < low_pulse[num] && low_pulse[num] < 660) {      //0.56ms
                    if (1450 < high_pulse[num] && high_pulse[num] < 1800) {  //1.69ms = 1, 0.56ms = 0
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
                }
            }
        }
        //check the data and return the data to IR receiver class.
        if ((tempAddress + inverseAddress == 0xff) && (tempCommand + inverseCommand == 0xff)) {
            IR_R.address = tempAddress;
            IR_R.command = tempCommand;
        } else {  //Return -1 if check error.
            IR_R.address = -1;
            IR_R.command = -1;
        }
    }
    /**
     * Connects to the IR receiver module at the specified pin.
     * @param pin IR receiver pin, eg: DigitalPin.P0
     */
    //% subcategory="IR Remote"
    //% blockId="makerbit_infrared_connect"
    //% block="connect IR receiver at %IR_pin"
    //% IR_pin.fieldEditor="gridpicker"
    //% IR_pin.fieldOptions.columns=4
    //% IR_pin.fieldOptions.tooltips="false"
    //% weight=90
    export function connectInfrared(IR_pin: DigitalPin): void {
        IR_R.IR_pin = IR_pin;   //define IR receiver control pin
        IR_init(IR_R.IR_pin);   //initialize the IR receiver
    }
    /**
     * Returns the code of the IR button that is currently pressed and 0 if no button is pressed.
     * It is recommended to delay 110ms to read the data once
     */
    //% subcategory="IR Remote"
    //% blockId=makerbit_infrared_pressed_button
    //% block="IR button"
    //% weight=57
    export function pressedIrButton(): number {
        IR_data_processing();
        /*let i: number = 0;
        for (i = 0; i < 33; i++) {
            basic.showNumber(low_pulse[i]);
            basic.pause(500);
        }*/
        return IR_R.command;
    }
}

