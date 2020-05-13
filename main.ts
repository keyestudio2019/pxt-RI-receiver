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
     * create a IR receiver class
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
    let IR_R = new IR_rec;
    let maxPulse: number = 17;      //define nec maximum number of pulses is 34
    //Divided into high and low pulse 17
    let low_pulse: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let high_pulse: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let LpulseCounter: number = 17; //must define for 17,
    let HpulseCounter: number = 17; //otherwise there is a risk of error in receiving the first data. 
    let LpulseTime: number = 0;
    let HpulseTime: number = 0;
    let pulse9ms: boolean = false;
    let pulse4ms: boolean = false;

    /**
     * initialize the IR receiver
     */
    function IR_init(IR_pin: DigitalPin) {
        pins.onPulsed(IR_pin, PulseValue.Low, () => { //interrupt event
            LpulseTime = pins.pulseDuration();        //measure the pulse
            if (8500 < LpulseTime && LpulseTime < 9500) {
                LpulseCounter = 0;
            }
            if (LpulseCounter < maxPulse) {
                low_pulse[LpulseCounter] = LpulseTime;
                LpulseCounter += 1;
            }
        });
        pins.onPulsed(IR_pin, PulseValue.High, () => {
            HpulseTime = pins.pulseDuration();
            if (4000 < HpulseTime && HpulseTime < 5000) {
                HpulseCounter = 0;
            }
            if (HpulseCounter < maxPulse) {
                high_pulse[HpulseCounter] = HpulseTime;
                HpulseCounter += 1;
            }
        });
    }
    /**
     * Convert the pulse into data
     */
    function IR_data_processing() {
        //confirm start signal
        if (8500 < low_pulse[0] && low_pulse[0] < 9500 && 4000 < high_pulse[0] && high_pulse[0] < 5000) {

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
        IR_R.IR_pin = IR_pin;
        IR_init(IR_R.IR_pin);
    }
    /**
     * Returns the code of the IR button that is currently pressed and 0 if no button is pressed.
     */
    //% subcategory="IR Remote"
    //% blockId=makerbit_infrared_pressed_button
    //% block="IR button"
    //% weight=57
    export function pressedIrButton(): number {
        return high_pulse[0];
    }
}

