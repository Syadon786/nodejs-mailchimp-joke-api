const mailchimp = require(`./mailchimp.js`);

const CronJob = require('cron').CronJob;

const jobCreateCampaign = new CronJob('00 09 * * *', mailchimp.createCampaign);
const jobSetupAndSendCampaign = new CronJob('00 12 * * *', mailchimp.setupAndSendCampaign);
const jobDeleteCampaign = new CronJob('00 15 * * *', mailchimp.deleteCampaign);

exports.startJobs = () => {
    if(!jobCreateCampaign.running) {
        jobCreateCampaign.start();
        console.log("Job cremaateCampaign is running.");
    }
    if(!jobSetupAndSendCampaign.running) {
        jobSetupAndSendCampaign.start();
        console.log("Job setupAndSendCampaign is running.");
    }
    if(!jobDeleteCampaign.running) {
        jobDeleteCampaign.start();
        console.log("Job deleteCampaign is running.");
    }
};