# todoist_by_mail
Simple NodeJS application that will listen for new mails on account defined in imap config(in config.js file). On receiving new mail it will add new task to Todoist account that have token defined in config.js file.

Mail form:

to: mail.defined@in.imap  
cc: mail.of.user.that@is.collaborator  
subject: Todoist project name  
mailbody first line: is task text  
mail body second line:  date string in [format](https://todoist.com/Help/DatesTimes) (optional)   
mail body third line: is priority of task(1-4) (optional)  

For example:  
If we have Todoist account with project named "Work", collaborator at that project with mail "collaborator@test.mail" and mail that this nodejs application monitoring is "monitored.mail@test.mail". Then we can add new task like this:  
  
to: monitored.mail@test.mail  
cc: collaborator@test.mail  
subject: Work  
mail body first line: My new task  
mail body second line (optional): today  
mail body third line (optional): 3  
