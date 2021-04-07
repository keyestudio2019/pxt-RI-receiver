// Auto-generated. Do not edit.



    //% color=50 weight=80
    //% icon="\uf1eb"
declare namespace maqueenIRV2 {
}



    //% color=50 weight=80
    //% icon="\uf1eb"
declare namespace keyestudioIR {

    /**
     * button pushed.
     */
    //% blockId=ir_received_left_event
    //% block="on |%btn| button pressed" shim=keyestudioIR::onPressEvent
    function onPressEvent(btn: RemoteButton, body: () => void): void;

    /**
     * initialises local variablesssss
     */
    //% blockId=ir_init
    //% block="connect ir receiver to %pin" shim=keyestudioIR::initIR
    function initIR(pin: Pins): void;
}

// Auto-generated. Do not edit. Really.
