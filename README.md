# PlanToGo
#### Video Demo:  https://youtu.be/-M3psQKiPM4
#### Description:
PlanToGo is a web application designed to simplify travel planning and organization. It consists of three main components, such as Checklist, Itinerary, and Budget. The main idea is to have all components for the travel related preparation in one place.

The web application is built using Javascript, Node.js, MariaDB/SQL, EJS, and CSS.

#### Registration and Sign in
The registration/sign-in feature improves the user experience by allowing users to create personalized accounts, save their password as well as confirming it.

User Registration:
Users have the ability to create an account by registering with the application. During registration, users provide their necessary information such as email address and password. The registration process includes validation checks, such as checking whether the user's email already exists in the database and hashing the password. 

Sign-In:
Once registered, users can sign in to their account using their credentials (email and password). The sign-in process verifies the user's credentials against the stored data in the MariaDB. Successful sign-in grants users access to their personalized data and features within the application.

#### Checklist
The Checklist feature provides users with a tool to manage their travel preparations. 

Multiple Categories:
The Checklist is organized into six categories: documents, general, toiletries, clothes, medicine, and to-do list. Each category focuses on specific aspects of travel planning and ensures that users cover all essential items. By categorizing items, users can easily navigate through the checklist and find relevant items based on their needs.

Customization and Modification:
While the Checklist provides a set of default items, users have the flexibility to modify and customize it according to their specific requirements. Users can add new items to the checklist that are relevant to their travel plans or remove items that are not applicable.

Persistent Data Storage:
The actions performed by users, such as adding or removing items from the checklist, are saved in the MariaDB. When users revisit the application, all their checklist information is retrieved from the database. Users can continue their planning without losing any previously added items.

Marking Items as Taken
When users are packing their bags, they can mark items as "taken" within the checklist. Marking items as taken helps users visualize what items are still pending to be packed, making the process more efficient and organized.

Easy Reset for Future Trips:
With a single click, users have the option to move all checklist items back to the list for future trips. This feature simplifies the preparation process for subsequent journeys.

#### Itinerary
The Itinerary feature provides users with a convenient way to plan and organize their travel schedule. Users can input the date and specify the city or destination they will be visiting on each day of their trip. Additionally, users can add comments or notes that provide valuable information, such as sightseeing spots, restaurant recommendations, or reminders for specific activities during their stay. 

The Itinerary feature utilizes the MariaDB to store and retrieve user-specific itinerary information. Users can easily access their saved itineraries, make further modifications, or refer back to their previous travel plans for reference when planning future trips.

#### Budget
The Budget feature allows users to track their expenses and manage their travel budget effectively. Users can record their travel expenses by providing a description of each expense. The Budget feature provides a dropdown list of categories, allowing users to assign each expense to a specific category for better organization. 

The Budget feature automatically calculates and displays the total expenses based on the accumulated costs of all recorded expenses. This allows users to have a clear overview of their travel expenditure and helps them stay within their budgetary limits.

#### Project Files
server.js: The main file that sets up the Express server and defines the routes for the application.
checklist.js: Contains middleware functions for managing the checklist feature, including inserting and deleting items from the checklist and rendering the checklist view.
db.js: Sets up the database connection pool using the mysql2 library.
repository.js: Used to create a repository for storing data in file. The "Contact Us" messages are stored in the messages.json repository.
public/: Directory for storing static assets such as images, CSS stylesheets and client-side JavaScript files.
views/: Directory for storing the EJS templates used to render the HTML views of the application.

#### Design Choices
Express: The application is built using the Express framework to handle HTTP requests, define routes, and render dynamic views.
MariaDB: The MariaDB database is used to store and retrieve data such as user information, checklists, itinerary details, and budget entries. The mysql2 library is used to interact with the MariaDB database. It provides a JavaScript API for connecting to the database and executing queries.
EJS Templates: The application uses EJS templates to generate dynamic HTML views. EJS allows for the inclusion of JavaScript code within HTML, making it easy to generate dynamic content based on data retrieved from the server.
Session Management: The application uses the express-session middleware and cookie-parser library to handle session management and user authentication. User sessions are stored in memory, and a session ID is stored in a browser cookie to maintain session state between requests.
Password Hashing: User passwords are hashed using the bcrypt library before being stored in the database. This adds an extra layer of security by ensuring that passwords are not stored in plaintext.

#### Usage
To use the application, first install the dependencies with: npm install.

#### Executing program
The program can be run with the following command: node server.js OR nodemon server.js (if nodemon installed). 
