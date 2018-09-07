# StatusHub Outbound (from xMatters) Integration
This is part of the xMatters Labs awesome listing. For others, see [here](https://github.com/xmatters/xMatters-Labs)
With this Outbound Integration, notification recipients can quickly create, update, and resolve StatusHub incidents, right from the xMatters notification! 

This document details how to install and use this integration. 

---------

<kbd>
<img src="https://github.com/xmatters/xMatters-Labs/raw/master/media/disclaimer.png">
</kbd>

---------

# Pre-Requisites
* [StatusHub.io](https://www.StatusHub.io/) account
* Existing communication plan - Use a packaged integration from the [integrations](https://www.xmatters.com/integrations) page, or [build your own](https://support.xmatters.com/hc/en-us/articles/202396229) 
* xMatters account - If you don't have one, [get one](https://www.xmatters.com)! 

# Files
* [StatusHub.js](StatusHub.js) - This is the code for the Shared Library that abstracts the interactions with StatusHub to a higher level. 
* [OutboundResponseScript.js](OutboundResponseScript.js) - This is the Outbound Response script that accepts the response from the notification recipient, inspects the response option selected, and makes the function calls to the StatusHub shared library create a new Incident or change the status. 
* [OutboundResponseScript.js](OutboundMessageScript.js) - This is the Outbound Response script that accepts updates with comments from the notification recipient and adds the update to the StatusHub Incident.

# Installation
## Get StatusHub Token
1. Log in to your StatusHub.io account as an admin user
2. Click `Settings` in the top right corner, and then select `API Key` from left toolbar
3. On the API tab, click `Generate new API Key`, then copy the generated API Key
<img src="media/API key.png" alt="API key" style="border:5px solid #000000;">


## Add Outbound Integration
1. Log in to your xMatters instance as a user with the Developer role (or anyone with access to the target communication plan). On the Developer tab, click Edit > Integration Builder for the target communication plan
2. Click 'Edit Endpoints', and then click `Add Endpoint` to add an endpoint for StatusHub; fill out the following details:

| Item | Selection |
| ---- | --------- |
| Name | StatusHub |
| Base URL | https://api.statushub.io/ |

3. Click Save and Close.
4. Click the `Edit Constants` button and `Add Constant`; fill out the following details to create a constant to hold the API key:

| Item | Selection |
| ---- | --------- |
| Name | StatusHub API Key |
| Value | API_KEY_VALUE |
Where API_KEY_VALUE is the API Key from StatusHub in the steps above.

5. Click `Save Changes`, then click `Add Constant`; fill out the following details to create a constant to hold the subdomain:

| Item | Selection |
| ---- | --------- |
| Name | StatusHub Subdomain |
| Value | SUBDOMAIN |
Where SUBDOMAIN is the subdomain from StatusHub, for example, if your StatusHub page is `example.statushub.io`, SUBDOMAIN would be `example`.

6. Click `Save Changes`, then click `Add Constant`; fill out the following details to create a constant to hold the Service name:

| Item | Selection |
| ---- | --------- |
| Name | StatusHub Service Name |
| Value | SERVICE_NAME |
Where SERVICE_NAME is the name of the service you would like the integration to create StatusHub Incidents under

7. Expand the Shared libraries section (if necessary) and click the `+ Add` button
7. Update the name at the top from `My Shared Library` to `StatusHub`, then paste in the contents of the [StatusHub.js](StatusHub.js) file and hit `Save`.
8. Expand the Outbound Integrations section (if necessary) and click the `+ Add` button. (We are going to add two new scripts here, but don't worry: this will not impact any existing scripts. You can have several outbound integrations that all run on notification response, as long as you add logic to each one to determine if they should fire.) 
9. Fill out the following details in the wizard to create and resolve incidents:

| Item | Selection |
| ---- | ---- |
| Set your trigger | Event Comments | \<Choose the appropriate form> |
| Action               | Run a script |
| Name                | \<Form name> - Create/Resolve StatusHub Incidents <br/> **Note** The Integration name format is arbitrary, but including the form name and `StatusHub` helps fellow developers see what a script does |
| Edit the Script | Paste the contents of the [OutboundResponseScript.js](OutboundResponseScript.js) file, then hit `Save` |

10. Click `Update Outbound Integration`, then use the breadcrumbs to return to the list of Integration Services. 
11. Expand the Outbound Integrations section (if necessary), and click the  `+ Add` button, then fill out the following details in the wizard to update incidents with a comment:
| Item | Selection |
| ---- | ---- |
| Set your trigger      | Event Comments, \<Choose the appropriate form> |
| Action                     | Run a script |
| Name                      | \<Form name> - Update StatusHub Incident with Comment <br/> **Note** The Integration name format is arbitrary, but including the form name and `StatusHub` helps fellow developers see what a script does.  |
| Edit the Script        |  Paste the contents of the [OutboundMessageScript.js](OutboundMessageScript.js) file, then hit `Save` |

12. Click `Update Outbound Integration`, then use the breadcrumbs to return to the list of Integration Services
13. On the Forms tab of the communication plan, click Edit > Responses for the relevant form that will handle the StatusHub response options. 
14. Add the following response options with the related attributes. You can change the text displayed, but the code in the the response scripts you just copied into the Outbound integrations will reference the value in the `Response` column. If you do change the text, make sure to update the OutboundResponseScript and the OutboundMessageScript to reflect the value in the Response column. 

| Response | Email Description | Voice Prompt | Options  |
| -------- | ----------------- | ------------ | -------- |
| Create StatusHub Incident               | Stop escalations and create StatusHub Incident               | Create StatusHub Incident  | Assign to User |
| Update StatusHub Incident with Comment  | Enter text in the comment field to pass to StatusHub  | Update StatusHub Incident | Assign to User  `✓ Enable Comments` |
| Resolve StatusHub Incident              | Stop escalations and resolve StatusHub Incident | Resolve StatusHub Incident | Assign to User |


# Testing

Testing the changes will differ based on your specific communication plan, but new events will have three new response options. For example:

**Example response options**

<img src="media/Response Options.png" alt="Response Options" style="border:5px solid #000000;">

**Example Incident that has been created, updated, and resolved using response options**

<img src="media/Example Incident.png" alt="Example Incident" height="400" style="border:5px solid #000000;">


First, select the `Create StatusHub Incident` option to generate the incident. Then use the `Update StatusHub Incident with Comment` option to add a comment to the StatusHub incident, and the `Resolve StatusHub Incident` option to resolve the incident.
