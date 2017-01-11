# todoist_by_mail
Simple NodeJS application that will listen for new mails on account defined in imap config(in config.js file). On receiving new mail it will add new task to Todoist account that have token defined in config.js file.

Mail form:
to: mail.defined@in.imap
cc: mail.of.user.that@is.collaborator
subject: Todoist project name
body: first line is task text
      second line is date string(otional)
      third line is priority of task(1-4)
