### Database Schema

Add data to the database like so:

`node gridfs-add.js data_file.json pid.json`, where the latter file is named after the pid of the desired problem. Alternatively, you may do `node gridfs-add.js pid.json` if the test file already shares a name with the pid.

The `problems` collection stores metadata pertinent to each problem.

```
collection: problems
{
	"problems": [						An array of all problems
    	{								
		"pid": "ex",                Problem ID, uniquely identifies the problem. Cannot contain spaces (convert space to underscore)
            "name": "Example Problem"   Problem's name as it will be displayed on the Problems page
            "partial": 0,			    1 for partial points, 0 for binary scoring
            "value": 10,				    Point value of the problem
            "langs": "C;C++;Haskell"	(Maybe do this?) List of valid languages for the problem, semicolon delimited. If blank, no restriction.
    	}
	]
}
```

The `problemData` collection is to be implemented with GridFS, to get around file size limits inherent to MongoDB. This collection keys the problem ID to relevant problem data, such as problem statement and test cases.
```
collection: problemData
[
	"ex": {
		"statement": "This is an example problem statement",
        "data": [
        	"test case 1",
            "test case 2"
		],
        "solution": [
        	"test case 1",
            "test case 2"
		],
        "submissions": [
        	"submissionID1", "submissionID2"
        ]
	}
]
```

The `submissions` collection is also to be used with GridFS. It maps submission ID's to the code, user, and results of a submission. Submission ID's can be generated either as numbers, or as UUID's. The `users` collection contains a list of all submissions made by that user.
```
collection: submissions
[
	"submissionID1": {
    	"code": "#include <iostream>\nusing namespace std;\nint main() {\nprintf("Test");\n}\n"
        "user": "spencereir"
        "points": 0				
        Not sure if this is needed, but this would provide an easy way to tally points a user has when they submit (by recalculating all points we avoid accidentally double counting
    }
]
```
