var querystring = require('querystring');
var config=require('./config');
var todoist_token = config.todoist_token;

var imap = {
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    tls: config.tls,
    tlsOptions: config.tlsOptions
};
var post_data_project_list = querystring.stringify({
    'token': todoist_token,
    'sync_token': '*',
    'resource_types': '["projects"]',

});
var options_project_list = {
    hostname: 'todoist.com',
    port: 443,
    path: '/API/v7/sync',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data_project_list)
    }
};

var post_data_collaborators_list = querystring.stringify({
    'token': todoist_token,
    'sync_token': '*',
    'resource_types': '["collaborators"]',

});
var options_collaborators_list = {
    hostname: 'todoist.com',
    port: 443,
    path: '/API/v7/sync',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data_collaborators_list)
    }
};




module.exports = {
    'imap': imap,
    'post_data_project_list': post_data_project_list,
    'options_project_list': options_project_list,
    'post_data_collaborators_list': post_data_collaborators_list,
    'options_collaborators_list': options_collaborators_list
};