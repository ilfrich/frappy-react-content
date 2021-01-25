# React Content

Content Management, Display Components and API Handlers 

## Usage

You need to provide the model for your various types of content as configuration to the component. References are used
 to associate content with IDs for other domain objects that you want to assign stuff to:

```javascript
import React from "react"
import { ContentManager } from "@frappy/react-content"

const SomeComponent = props => (
    <ContentManager
        references={["demo1", "demo2"]}
        contentTypes={{
            description: {
                list: false,
                fields: ["title", "description"],
            },
            team: {
                list: true,
                fields: ["name", "role"],
            },
            papers: {
                list: true,
                fields: ["title", "authors", "publication", "year"],
            },
        }}
    />
)
```

## API Endpoints

The following assumes the default prefix `/api/content`. URL parameter are prefixed with `:`

- GET `/api/content` - retrieves a list of all content objects
- GET `/api/content/:contentId` - retrieves a specific content object

**Content Management Endpoints**

- POST `/api/content` - creates a new content object with `label`, `contentType`, `references` and `content` in the body
- POST `/api/content/:contentId` - updates content object with `label`, `references` and `content` in the body
- DELETE `/api/content/:contentId` - deletes a content object

## Content Handler

The package also provides an API handler class that allows to easily query content objects from the database:

```javascript
import { ContentHandler } from "@frappy/react-content"

const handler = new ContentHandler()  // pass an optional argument, if you use a different API prefix on the backend
// get all
handler.getContentList().then(allContent => {
    // allContent is an array of all content objects
})  
// filter by reference
handler.getContentList("demo1").then(demo1Content => {
    // demo1Content is only content assigned to reference "demo1"
})
// filter by reference and content type
handler.getContentList("demo1", "team").then(demo1TeamContent => {
    // list of content of type "team" and associated to "demo1" (reference)
})
// just filter by content type
handler.getContentList(null, "team").then(teamContent => {
    // gives a list of "team" content types
})
``` 