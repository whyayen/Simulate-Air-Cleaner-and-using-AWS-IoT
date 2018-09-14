# Simulate Air Cleaner and using AWS IoT




## Scenario
[AWS IoT] (https://aws.amazon.com/iot/) provides secure, bi-directional communication between Internet-connected devices such as sensors, actuators, embedded micro-controllers, or smart appliances and the AWS Cloud. This enables you to collect telemetry data from multiple devices, and store and analyze the data. You can also create applications that enable your users to control these devices from their phones or tablets.
In this scenario, we will use MQTT.fx to simulate an air cleaner. It will send some information to the AWS IoT platform continuously. The information contains device ID, device type, device name, device status, air PM2.5 value, air quality. In AWS IoT platform, we will set some actions. First, we store the information in DynamoDB, Second, when PM2.5 value reach the harmful level, AWS IoT will send a message to tell the device to turn on the power. In the same time, we also can send an email to tell the user that air is dirty, we will open the device automatically. When air PM2.5 value back to normal level, IoT send a message to tell the device to turn off the device.


![1.png](/images/1.png)


## Prerequisites
>The workshop’s region will be in ‘N.Virginia’

*	Sign-in a AWS account, and make sure you have select N.Virginia region. 
* 	Download source file from github.
*	Download MQTT.fx (1.6.0)：  http://mqttfx.jensd.de/index.php/download
![2.png](/images/2.png)


## Lab tutorial
### Create a IoT Type
1.1. Open AWS Manage Console and Sign in.

1.2. Click **IoT Device Management** under service.

1.3. Click **Types** under Manage at left navigation bar.

1.4. Click **Create**, and you will see **Create a thing type** page.

1.5. Type a name for the thing type.

1.6. Click **Create thing type**.


### Create a IoT Thing.

2.1. Click **Things** under Manage at left navigation bar.

2.2. Click **Register a thing**.

2.3. Click **Create a single thing**.

2.4. Type **air_cleaner_demo** for the thing name.

2.5. In Apply a type to this thing section, select the type you create previously.

2.6. Let another settings default, click **Next**.

2.7. In Add a certificate for your thing section, click **Create certificate**.

![3.png](/images/3.png)

2.8. Download all the key file and click **Activate**.

2.9. Click **Attach a policy**.

2.10. Click **Register thing**.

### Create a Secure Policy and Attach on Certificate

3.1. Click **Secure** and click **Policies** at left navigation bar.

3.2. Click **Create a policy**.

3.3. Type a name for policy.

3.4. In **Add Statements** section, type **iot:＊** in Action part, type **＊** in Resource ARN type..

![4.png](/images/4.png)

3.5. Check **Allow**, then click **Create**.

3.6. Click **Certificates** at left navigation bar.

3.7. Click the Certificate you create previously.

![5.png](/images/5.png)

3.8. Click **Actions**, then click **Attach policy**.

3.9. Select the policy you create previously, then click **Attach**.


### Add the Certificates to MQTT.fx and Test

4.1. Open MQTT.fx, when it asks you to update, click **No**.

4.2. Click the gear.

![6.png](/images/6.png)

4.3. Type a name for **Profile name**.

4.4. Go back to IoT thing, click the thing you create previously, then click **Interact**.

4.5. Copy the endpoint.

![7.png](/images/7.png)

4.6. Back to MQTT.fx, paste it to **Broker address**.

4.7. Type **8883** in **Broker Port**.

4.8. Click **Generate** to generate a Client ID.

4.9. Select **SSL/TLS**, select **Enable SSL/TLS**, then select **Self signed certificates**.

4.10. In **CA File**, choose the file name end with **.pem.txt**.

4.11. In **Client Certificate File**, choose the file name end with **.pem.crt**.

4.12. In **Client Key File**, choose the file name end with **.pem.key**.

4.13. Check **PEM Formatted**.

![8.png](/images/8.png)

4.14. Click **Apply** then click **OK**.

4.15. Click **Connect** to connect the AWS IoT platform.

4.16. Type **/test/topic** in the topic field, and copy below code and paste into the blank field

	{
		"id": "12345678",
		"type": "air_cleaner",
		"name": "Demo",
		"power": "OFF",
		"pm": 1,
		"quality": "Green"
	}

![9.png](/images/9.png)

4.17. Back to AWS IoT platform, click **Test** at left navigation bar.

4.18. Type **/test/topic** in Subscription topic field, then click **Subscribe to topic**

4.19. Back to MQTT.fx, then click Publish, and you will see the message on the AWS IoT Platform

![10.png](/images/10.png)

### Create a Rule to save message in DynamoDB

5.1. In AWS IoT platform, click **Act** at left navigation bar.

5.2. Click **Create a rule**.

5.3. Type **Save_in_DynamoDB** as name.

5.4. Type **＊** in Attribute at Message source.

5.5. Type **device/aircleaner** in Topic filter.

5.6. Let condition blank, click **Add action**.

![11.png](/images/11.png)

5.7. Select **Insert a message into a DynamoDB table**, then click **Configure action**.

5.8. Click **Create a new resource**.

5.9. Click **Create table**.

5.10. Type **air_cleaner_message** as Table name.

5.11. Type **device_id** as Partition key, then click **Create**.

5.12. Back to IoT rule create page, click reload and choose **air_cleaner_message**.

5.13. Type **$id** as Hash key value.

5.14. Click **Create a new role**.

5.15. Type **IoT_save_DynamoDB** as role name, then click **Create a new role**.

5.16. Select the **IoT_save_DynamoDB** role, and click **Add action**. 

![configure_action.png](/images/configure_action.png)

5.17. Click **Create rule**.

5.18. Go back MQTT.fx, type **device/aircleaner** as topic name.

5.19. Copy the **air_cleaner.json** code and paste to MQTT.fx, then click **Publish**

5.20. Go back to DynamoDB page, and you will see the message save in the table.


### Send an Email when Air Quality reach threshold

6.1. In AWS IoT Platform, click **Act**, then click **Create**.

6.2. Type **send_warning_email** as name.

6.3. Type **＊** in attribute, type **device/aircleaner** in topic filter, type **pm=50** in condition.

![12.png](/images/12.png)

6.4. Click **Add action**.

6.5. Select **Invoke a Lambda function passing the message data**, then click **Configure action**.

6.6. Click **Create a new resource**.

6.7. Type **Air_warning** as Lambda name.

6.8. Select **Create a custom role**.

6.9. Click **View policy document**, then click **Edit**, when warning pump out, click **OK**.

6.10. Copy below code and paste it to policy document, then click **Allow**.

	{
  		"Version": "2012-10-17",
  		"Statement": [
    		{
      			"Effect": "Allow",
     			"Action": [
        			"logs:CreateLogGroup",
        			"logs:CreateLogStream",
        			"logs:PutLogEvents"
      			],
      			"Resource": "arn:aws:logs:*:*:*"
    		},
    		{
      			"Effect": "Allow",
      			"Action": "sns:*",
      			"Resource": "arn:aws:sns:*:*:*"
    		}
  		]
	}

6.11. Click **Create function**.

6.12. Copy **air_quality_harmful.js** code, and paste it to Lambda code field.

6.13. In **Environment variables** section, type **email** as key, type your email as value, then click **Save**.

6.14. Back to IoT rule create page, click reload and select **Air_warning**, then click **Add action**.

![13.png](/images/13.png)

6.15. Click **Create rule**.

6.16. Go to MQTT.fx, set pm value as **50**, and set quality as **RED**, then click **Publish**.

![14.png](/images/14.png)

6.17. You will receive an email that contain device name, pm value, and air quality level.

### Use Rule to trigger Open and Shutdown Device

7.1. At IoT **Act** page, click **send_warning_email**.

7.2. Click **Add action**, then click **Invoke a Lambda function passing the message data**, then click **Configure action**.

7.3. Click **Create a new resource**.

7.4. Type **OpenDevice** as Lambda name.

7.5. Click **Create a custom role**.

7.6. Select **Create a new IAM Role** as IAM Role.

7.7. Type **Lambda_send_mqtt** as Role name.

7.8. Copy the below code and paste it to policy document, then click **Allow**.

	{
  		"Version": "2012-10-17",
  		"Statement": [
    		{
      			"Effect": "Allow",
      			"Action": [
        			"logs:CreateLogGroup",
        			"logs:CreateLogStream",
        			"logs:PutLogEvents"
      			],
      			"Resource": "arn:aws:logs:*:*:*"
    		},
   			{
      			"Effect": "Allow",
      			"Action": "iot:*",
      			"Resource": "arn:aws:iot:*:*:*"
   			}
		]
	}
    
7.9. Copy the **deviceON.js** code and paste it to the Lambda code field, then save.

7.10. Remember to change your endpoint.

![15.png](/images/15.png)

7.11. Back to Rule creation page, click reload and select **OpenDevice**, then click **Add action**.

7.12. Now Back to your IoT thing, click your thing, and click **Shadow**.

7.13. You can see there is no shadow for device, so we need to create one.

7.14. Back to MQTT.fx, type **$aws/things/air_cleaner_demo/shadow/update** as topic name.

7.15. Copy below code and paste it to the field. This action is try to report the air cleaner current status to shadow engine.

	{
		"state": {
			"reported": {
				"power": "OFF"
			}
		}
	}

![16.png](/images/16.png)

7.16. Click **Publish**, then go back to IoT platform. You will see the shadow is change.

![shadow.png](/images/shadow.png)

7.17. Now let try to trigger the rule to open device automatically. Go back MQTT.fx, type **device/aircleaner**.

7.18. Copy below code to MQTT.fx, and change the pm value to **50**, air quality to **RED**.

	{
		"id": "12345678",
		"type": "air_cleaner",
		"name": "Demo",
		"power": "OFF",
		"pm": 1,
		"quality": "Green"
	}

7.19. Now **Publish** it, you should receive an warning email, and go back to see the thing shadow, it should have desire state.

![17.png](/images/17.png)

7.20. Go back to **Act** page, then click **Create**.

7.21. Type **Device_Auto_OFF** as name.

7.22. Type **＊** as attribute, type **device/aircleaner** as topic filter, type **pm=20 AND power = “ON”** as condition.

>please don’t copy but type yourself on this condition **pm=20 AND power = “ON”**

7.23. Click Add action, click **Invoke a Lambda function passing the message data**, then click **Configure action**.

7.24. Click **Create a new resource**.

7.25. Type **ShutdownDevice** as name.

7.26. Select **Choose an existing role** as Role.

7.27. Select **Lambda_send_mqtt** as Existing role, then Click Create function.

7.28. Copy the **deviceOFF.js** code and paste it to the Lambda code field.

7.29. Remember to change your endpoint.

7.30. Click **Save**, and back to rule page, click reload and select **ShutdownDevice**, then click **Add action**.

7.31. Click **Create rule**.

7.32. Back to MQTT.fx, type **device/aircleaner** and change the pm value to **20**, and air quality to **GREEN**, then **Publish**.

7.33. You can go back the thing shadow to see the desire state is change to OFF.

![18.png](/images/18.png)

### Use Scripts to test the all work flow

8.1. In MQTT.fx, click **Scripts**, then click **Edit**.

8.2. Copy **air_cleaner_test.js** code and paste it to switch_fountain_test.js, save and close it.

8.3. Now you can click **Execute** to see how shadow change, and the workflow. The scripts will let MQTT.fx send message every second.

## Conclusion

Congratulations! You now have learned how to:
* How to register a device as a thing.
* Using Rule Engine to trigger other AWS service.
* Using Shadow Engine to update device states.



