# ---------------- Section  3 ---------------------
## ------- Architecture of Multi-Service app ------

  - Build a central library as an NPM module to share code between our different projects
  - Precisely define all of our envents in this shared library
  - Write everything in Typescript
  - Write tests for as much as possible/reasonable
  - run a k8s cluster in the cloud and develop on it almost as quickly as local
  - introduce a lot of code to handle concurrency issue

  # App Overview
    ------------Ticketing App--------------
    1: User can list a ticket for an event(concert, sports) for sale
    2: Other user can purchase this ticket
    3: Any user can list tickets for sale and purchase tickets
    4: When a user attempts to purchase a ticket, the ticket is locked for 15 minutes. The user 15 minutes to enter their payment info.
    5: While locked, no other user can purchase the ticket. After 15 minutes, the ticket should unlock
    6: ticket prices can be edited if they are not locked

  # Resources:
    Database design:
    User: email, password
    Ticket: title, prices, userId, orderId
    Order: userId, status, ticketId, expiresAt
    Charge: orderId, status, amount, stripeId, stripeRefundId

  # Services
    1: auth     : related to user signup/signin/out
    2: tickets  : ktct creation/editing
    3: orders   : Order creation/editing
    4: expiration: Whatches for orders to be created, cancels them after 15 minutes
    5: payments : handle credit card payment. Cancels orders if payment fails, completeds if payment successeds.

  # Events and architecture Design
    UserCreated, UserUpdated

    OrderCreated, OrderCancelled, OrderExpired

    TicketCreated, TicketUpdated

    ChargedCreated

        ___________      _____________________          _____________
        |         |<---- | Auth [node, mongo]|--------->|           |

        |         |<---- | tict [node, mongo]|--------->| NAT       |

client  | common  |<---- | Ordr [node, mongo]|--------->| streaming |
 
        |         |<---- | pmnt [node, mongo]|--------->| server    |

        |_________|<---- | expr [node, Redis]|--------->|___________|


  # auth Service
    | Route             |   Method  |   Body    |   Purpose
    1: /api/users/signup    POST      {e, p}      an account
    2: /api/users/signin    POST      {e, p}      Login
    3: /api/users/signout   POST        {}        Logout/sign out
    4: /api/users/currentU  GET         -         Return user info

    npm install typescript ts-node-dev express @types/express  


    thisisunsafe : to avoid chrom not secure issue
    hosts file path: C:\Windows\System32\drivers\etc

  # Remote dev with Skaffold

  Your computer [skaffold] => [rebuild Image] Google cloud build [Source code + Dockerfile = Docker build => updated Image] => [Update deployment] Google cloud VM[Deployment => Pod | Pod| Pod]


# Kubernetes cluster creation
  Menu => Kubernetes Enginee => Cluster => Create cluster => Default setting environment => name [tickiting-dev] => zone [selecte-nearest-zone] => master version [1.15-atleast]

  Node Pools [side-nav] => Nodes => Machine configuration [] => machine type [g1-small] => create


# kubectl CONTEXT
  CONTEXT => Some different connection settings
  install gcloud

# Initializing gcloud SDK
  gcloud auth login

  inside the root directory
  gcloud init
  create new configuration
  select project from list (Google cloud and find project Id)
  select default region. select it from kubernete menue and cluster

# Install GCloud Context
  Don't want to run Docker at all?
    close docker Desktop
    gcloud components install kubectl
    gcloud container cluster get-credentials <cluster name>

  Ok Still running docker
    gcloud container clusterd get credentials <cluster name>

  To see the current context : kubectl config current-context
  To list all the context    : kubectl config get-contexts
  to switch contexts         : kubectl config use-context <context-name>

# Update skaffold configuration
  Enable Google Cloud Build
    Lefttop Meneu, 
    cloud build => enable
    
  Update the skaffold.yaml file to use Google Cloud build
    build:
      googleCloudBuild:
        projectId: pacific-destiny-272719
      artifacts:
        - image: us.gcr.io/pacific-destiny-272719/auth
          context: auth
          docker:
            dockerfile: Dockerfile
          sync:
            manual:
              - src: 'src/*.ts'
                dest: .
  update auth-depl.yaml
    update image name with us.gcr.....


  Setup ingress-nginx on our google cloud cluster kubernetes.github.io/
  ingress-nginx
    official doc
    deployment
    mendatory command
    switch context
    copy GCE-GEK COMMAND AND PASTE ON CMD

  Update our hosts file again to point to the remote cluster
    topLeft => network services => Load balancing => Copy Ip address => Open host file => replace 127.0.0.1 with copied Ip address and save

  restart Skaffold

# Response Normalization Strategy

  # 1: CREATING ROUTE HANDLERS
                  auth

  # 2: Adding validation
  install express-validator
  add middleware in handler method
  use body

  # 3 handling Validation Errors
    validationResult
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

  # 4: Surprising Complexity aroud errors
    send same format of error data back to client

  # 5: Other Source of Error
    gibberish
    express-validator errors
    business logic error
    DB down error

  # 6: solution for Error Handling
    Consistently structured response form all servers
      Write error handling middleware
      Make sure we capture all posible errors using expess's error handling

    Error handling in express
      synchronous route
        throw new Error('BROKEN')
      asynchronous route
        next(err)

  # 7: Writing error handling middlewares

  # 8: Encoding more information In an Error
    We want an object like an 'Error', but we want to add in some more custom properties to it

    Error extends 
      : RequestVlidationError
      : DatabaseConnectionError

  # 9: determine error type
    instanceof RequestValidationError
    YES => Gererate errors by taking reasons prop
    NO  => instanceof DatabaseConnectionError
           YES => Errors by reasons props 
           NO  => Generic error msg

  # 10: Moving logic into erros
    RequestValidationError
      serializeError() commonErrorStructure
      statusCode 400
    RequestValidationError
      serializeError() commonErrorStructure
      statusCode 500

  # 11: varifying our custom error
    1:  interface CustomError {
          statusCode: number;
          serializeErrors(): {
              message: string;
              field?: string
          }[]
        }

    2:
      Abstract class
        - Cannot be instantiated
        - used to set up requirements for subclasses
        - Do Created a class when translated to JS, which means we can use it in instanceof check

        Abstract classes are a powerful feature in object-oriented programming that promote a clear structure and shared behavior across related classes while preventing direct instantiation. They help organize code and enforce consistency in a hierarchy of classes.

        Benefits of Using Abstract Classes
        Code Reusability: Common functionality can be defined in one place, reducing code duplication.
        Enforced Structure: Subclasses must implement the abstract methods, ensuring a consistent interface.
        Flexibility: You can define methods in the abstract class that can be shared or overridden by subclasses.
        Summary

  # 11: Async error Handling
    call next function with error
    Or you can install express-async-errors package and import in entry file as import 'express-async-errors'

# Section 8: Database management And Modeling

  # 1: Creating Database in Kubernetes
    create auth-mongo-depl.yaml file and add Deployment and service
    Use default base image 'mongo'

  # 2: connecting to MongoDB

  # 3: Mongoose UserModel
    import mongoose from "mongoose";

    const userSchema = new mongoose.Schema({
        email: {
            type: String,
            require: true,
        },
        password: {
            type: String,
            require: true
        },

    })

    export const User = mongoose.model('User', userSchema)

  # 3: Typechecking user properties
    new User({
      email: 0980990,
      password: true
    })
    This will not cause an issue

  # 4: Adding static property Propery on Model
    userSchema.statics.build = (attrs: UserAttrs)=> {
        return new User(attrs)
    }

    User.build({
        email: 'lkdf',
        password: ''
    })

  # 5: Whats that Angle Brackets for?<>
    Generics in TypeScript allow you to create reusable components that can work with a variety of data types without sacrificing type safety. This means you can define a function, class, or interface that can operate on different types while still providing strong typing

    const genericFun = <T>(val: T): T=> {
        return val
    }

    class Box<T> {
        private content: T;
        constructor(content: T) {
            this.content = content
        }
    }
    const numBox = new Box(50);
    const strBox = new Box('bob')

  # 6: Password Hashing
    
    - Hashing is a one-way process used for data integrity and storage (like passwords).
      MD5 (message digest algorithm 5)
      SHA1 (Secure Hash algorimth 1)
      SHA2 (Secure Hash algorimth 2)
      SHA3 (Secure Hash algorimth 3)
    - Encryption is a two-way process used to secure data so that only authorized users can access it.

  # 7: mongoose pre-save hooks
    userSchema.pre('save', async function(done) {
        if (this.isModified('password')) {
            const hashed = await Password.toHash(this.get('password') ?? '')
            this.set('password', hashed);
        }
        done();
    })

  # 8: fundamental Authentication Strategies:
    Sync communtioncation: Rely on auth service
    Async: individual services rely on th auth service as Gateway

    
  # 9: Huge issue with authentication strategies
    
  
  # 10: Solving issue with option 2:
    If the JWT/cookies is older than 30 mins, reach to auth service
    Short-lived in memory cache recording banned users

  # 11: cookies vs JWT tokens
    Cookies are small pieces of data stored in the client’s browser, sent to and from the server with each HTTP request.

    JWT: Ideal for stateless authentication, includes all necessary information within the token, suitable for API-based architectures.


    Transfport mechanism, Moves any kind of data between browser and server, automatically managed by the browser.

    Authentication/authorization mechanism, stores any data we want, We have to manage it manually

  # 12 Microservice Auth requirementslt 
    Must be able to tell us details about a user
    Must be able to handle authorization info
    Must have a buit-in tamper-resistant to expire or invalidate itself
    Must be easily understood between different languages
    Must not require some kind of backing data store on the server.

  # cookies and Encryption
    npm i cookie-session

  # Generate JSON web token
    req.session.views = (req.session.views || 0) + 1
    npm i jsonwebtoken
    sign to create token(payload, key)
    verify
    base64
    jwt.io
    

  # Securely storing Secrets
    Expose secret with environment varible.

  # Creating and accessing secrets
    kubectl create secret generic jwt-secret --from-literal=jwt=asdf
    kubectl create secret generic jwt-secret --from-literal JWT_KEY=asdf_secret

    kubectl describe pod pod_name

  # Accessing env variable inside the POD
    process.env.JWT_KEY!
    ! denotes that this type check is already completed

  # Common response Property:
    Should return consistent looking responses.
    _id, mongo
    id: mySql, postgresql

  # Formatting JSON properties
    const person = {name: 'Jack'}
    JSON.stringify(person)

    const personTwo = {name: 'alex', toJSON() {return 1}}
    JSON.stringify(personTwo)
    "1"

  # the Signin flow
    Does a user with this email exist? if not response with an error
    Compare the passwordsof the stored user and the supplied password
    if passwords are the same, we're good!
    User is not considered to logged in. Send them a JWT  in cookie

  # Request validation middleware:
    import {Request, Response, NextFunction}from 'express'
    import { validationResult } from 'express-validator'
    import { RequestValidationError } from '../errors'

    export const validateRequest = (req : Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new RequestValidationError(errors.array())
        }
        next();
    }

  # Current User
    Does This user have a 'req.session.jwt' set?
    If it is not set, or IF THE JWT is inalid, return early
    If yes, and JWT is valid, send back the info stored inside the JWT (the payload)

  # Signout Route
    req.session = null


# Testing Isolated Microservice
  # Scope of testing
    Test a single piece of code in insolation      : Single middleware

    Test how different pieces of code word together: Request flowing through multiple middlewares to a request handler

    Test how different components word together    : make request to service, ensure write to database was completed

    Test how different Services work together      : Create a 'payment' at 'payments' service should affect the 'order' service

    Middleware => Route Hanlders => Models => MongodB => Event Bus |
  
  # Testing Goals
    Basic Request Handling
    Unit test
    Event emitting + receiving 
    npm run test

  # Testing Architecure
    npm run test
        |
      Jest

    Start in memory copy of MongoDB
    Start up our express app
    Use supertest library to make fake requests to our express app
    Run assertions to make sure the request did the right thing

  # Index to app refactor
    refactor index file code in app and export app
    import app in index file to start listen on particular port

    Few dependancies to make test environment
      npm install --save-dev @types/jest @types/supertest jest ts-jest supertest mongodb-memory-server

  # Test Environment setup
    "test": "jest --watchAll --no-cache"

  # First Test
    request(app)
      .post('api/users/signup')
      .send({
        email: "test@gmail.com",
        password: "password"
      })
      .expect(201)

  # Chaning node env during test
    app.use(cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    }))

  # React App
    - SSR (Server side rendering)
      browser ==> NextJs => auth/ Order/ Tick

      - fully rendered html file with content
      - user can see content much more quickly.
      - Lot more better for SEO

  # Initial setup
    build client image
      docker build -t stram/client .

    push to docker hub
      docker push stram/client