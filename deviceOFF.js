var AWS = require('aws-sdk');
var iotdata = new AWS.IotData({endpoint: '<your-end-point>'});
exports.handler = (event, context, callback) => {
    // TODO implement
    
    var params = {
        topic: '$aws/things/air_cleaner_demo/shadow/update',
        //topic: 'topic/test',
        payload: '{"state": {"desired": {"power": "OFF"}}}',
        qos: 1
        };
     iotdata.publish(params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            console.log("success?");
            //context.succeed(event);
        }
    });
};