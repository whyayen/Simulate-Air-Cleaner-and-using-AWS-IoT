var Thread = Java.type("java.lang.Thread");

function execute(action) {
    out("Test Script: " + action.getName());
    for (var i = 1; i < 51; i++) {
        var level = "GREEN";
        var power = "OFF"
        if(i >= 50){
            var level = "RED";
            var power = "ON";
        }
        reportedStatus(i,level,power);
        Thread.sleep(1000);
    }

   for (var i = 49; i > 0; i--) {
        var level = "RED";
        var power = "ON"
        if(i < 20){
            var level = "GREEN";
            var power = "OFF";
        }
        reportedStatus(i,level,power);
        Thread.sleep(1000);
    }

    action.setExitCode(0);
    action.setResultText("done.");
    out("Test Script: Done");
    return action;
}
function reportedStatus(i,level,power){
    out("Air PM Value:"+i+", Air Level:"+level+", Power:"+power);
    mqttManager.publish("device/aircleaner", JSON.stringify({"id": "12345678","type": "air_cleaner","name": "Demo","power": power,"pm":i,"quality":level}));
    if (i == 50) {
        Thread.sleep(3000);
        switchON();
    }
    if (i == 20 && power=="ON") {
        Thread.sleep(3000);
        switchOFF();
    }
}

function switchON() {
    out("Device ON");
    mqttManager.publish("$aws/things/air_cleaner_demo/shadow/update", JSON.stringify({"state": {"reported": {"power": "ON"}}}));
}

function switchOFF() {
    out("Device OFF");
    mqttManager.publish("$aws/things/air_cleaner_demo/shadow/update", JSON.stringify({"state": {"reported": {"power": "OFF"}}}));
}
//function reciveMQTT(){
   // var response = mqttManager.subscribe("$aws/things/air_cleaner_test/shadow/update/delta");
    //out(response.toString());
    //if response == JSON.stringify({"state": {"desired": {"power": "ON"}}}){
    //    return true;
    //}
    //if response == JSON.stringify({"state": {"desired": {"power": "OFF"}}}){
    //    return false;
    //}
//}

function out(message){
     output.print(message);
}
