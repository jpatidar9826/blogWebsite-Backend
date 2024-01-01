# blogWebsite-Backend

The backend uses mongodb as Database, API created using Express with Nodejs and Jason web tokens and Express Validators  for api routes token authentication and error modules.

This backend server provides following notes routes.
- /api/blogs/  Get method - get all notes.
- /api/blogs/:bid Get method - get a note by ID.
- /api/blogs/:bid Patch method - update note title or content.
- /api/blogs/:bid Delete method - delete note.
- /api/blogs/user/:uid Get method - to get all the blogs of specific user.

This backend server provides following user routes.
- /api/users/all Get method - Get all the users.
- /api/users/login Post method - Login.
- /api/users/signup Post method - Signup.
- /api/users/:uid Patch method - to update name of user.
- /api/users/:uid Delete method - to delete user with all his notes.
