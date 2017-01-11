var notifier = require('mail-notifier');
var https = require('https');
var querystring = require('querystring');
var config = require('./config');
const uuidV4 = require('uuid/v4');
var todoist_token = config.todoist_token;
var predefined_parameters = require('./predefined_parameters');

function TaskData(task, project_id, assign_to, assign_to_count, comment, date_string, priority) {
    this.task = task;
    this.project_id = project_id;
    this.assign_to = assign_to;
    this.assign_to_count = assign_to_count;
    this.comment = comment;
    this.date_string = date_string;
    this.priority = priority;
}

var imap = predefined_parameters.imap;

notifier(imap).on('mail', function (mail) {
    console.log("GOT MAIL");
    var task_data = new TaskData(undefined, undefined, []);
    var subject;
    var cc_list = [];
    if (mail.cc) {
        mail.cc.forEach(function (cc) {
            cc_list.push(cc.address);
        });
    }
    task_data.assign_to_count = cc_list.length;
    if (mail.subject) {
        subject = mail.subject;
    } else {
        subject = "";
    }
    var mail_text_lines = mail.text.split('\n');
    var task_text = "";
    var task_date_string = "";
    var task_priority = 1;
    if (mail_text_lines.length > 0) {
        task_text = mail.text.split('\n')[0];
    }
    if (mail_text_lines[1]) {
        task_date_string = mail.text.split('\n')[1];
    }
    if (mail_text_lines[2]) {
        var num = parseInt(mail_text_lines[2]);
        if (num) {
            if (num > 4) {
                num = 4;
            }
            if (num < 1) {
                num = 1;
            }
            task_priority = num;
        }
    }
    task_data.priority = task_priority;
    task_data.task = task_text;
    task_data.date_string = task_date_string;
    //console.log("Task data1: ",task_data);
    console.log(predefined_parameters.options_project_list);
    console.log(predefined_parameters.post_data_project_list);
    var projects = https.request(predefined_parameters.options_project_list, function (response) {
        HandleAllProjectsList(response, subject, task_data, cc_list);
    });
    projects.write(predefined_parameters.post_data_project_list);
    projects.end();


}).start();

function HandleAllProjectsList(response, project, task_data, cc_list) {
    //console.log("HandleAllProjectsList");
    var data = "";

    response.on('data', function (d) {
        data += d;
    });

    response.on('end', function () {
        //console.log("HandleAllProjectsList end");
        var projects_data = JSON.parse(data);
        var err;
        //console.log("HandleAllProjectsList projects: ",projects_data.projects);
        if (projects_data.projects.legth > 0) {
            for (var i = 0; i < projects_data.projects.length; i++) {
                if (projects_data.projects[i].name.trim().toLowerCase() == project.toLowerCase()) {
                    task_data.project_id = projects_data.projects[i].id;

                    //console.log("Task data: ",task_data);
                    var projects = https.request(predefined_parameters.options_collaborators_list, function (response) {
                        HandleAllCollaboratorsList(response, cc_list, task_data);
                    });

                    projects.write(predefined_parameters.post_data_collaborators_list);
                    projects.end();

                }
            }
        }else{
            console.log("No projects found");
        }
    });
}

function HandleAllCollaboratorsList(response, collaborators, task_data) {
    var data = "";
    response.on('data', function (d) {
        data += d;
    });

    response.on('end', function () {
        var collaborators_data = JSON.parse(data);
        collaborators_data.collaborators.forEach(function (x) {
            if (collaborators.indexOf(x.email) >= 0) {
                task_data.assign_to.push(x.id);
            }
        });
        CheckIsAllDataSubmited(task_data);
    });
}

function SubmitTaskToTodoist(token, project_id, task, assign_to, date_string, priority) {
    var assign_to_str = "[" + assign_to + "]";
    var command = '[{"type": "item_add", "temp_id": "43f7ed23-a038-46b5-b2c9-4abda9097ffa", "uuid": "' + uuidV4() + '", "args": {"content": "' + task + '", "project_id": ' + project_id + ', "responsible_uid":"' + (assign_to && assign_to.length > 0 ? assign_to[0] : "") + '", "date_string":"' + (date_string ? date_string : "") + '", "priority":' + (priority ? priority : "") + '}}]';
    console.log("Command: ", command);

    var post_data_submit_task = querystring.stringify({
        'token': todoist_token,
        'commands': command,
    });
    var options_submit_task = {
        hostname: 'todoist.com',
        port: 443,
        path: '/API/v7/sync',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data_submit_task)
        }
    };

    var submit_task_request = https.request(options_submit_task, function (response) {
        var data = "";
        response.on('data', function (d) {
            data += d;
        });

        response.on('end', function () {
            var resp = JSON.parse(data);
            console.log("Task added: ", resp.sync_status);
        });
    });

    submit_task_request.write(post_data_submit_task);
    submit_task_request.end();
}

function CheckIsAllDataSubmited(task_data) {
    var all_ok = true;
    if (task_data.project_id) {

        if (task_data.project_id <= 0) {
            console.log('Project id length 0');
            all_ok = false;
        }
    } else {
        console.log('No project id');
        all_ok = false;
    }
    if (task_data.task) {
        if (task_data.task <= 0) {
            console.log('Task id length 0');
            all_ok = false;
        }
    } else {
        console.log('No task');
        all_ok = false;
    }


    if (all_ok) {
        SubmitTaskToTodoist(todoist_token, task_data.project_id, task_data.task, task_data.assign_to, task_data.date_string, task_data.priority);
    }
}