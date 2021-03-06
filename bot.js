      /*Name: Asset Bot*/
      /*version- v06:*/
      /*Last updated:28/11/2017: 10:00 PM*/
      /*Author: Suryadeep*/

var restify = require('restify');
var builder = require('botbuilder');
var sql = require('mssql');
require('json-response');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var app = require('express');
var TYPES = require('tedious').TYPES;
var jsonFile = require('jsonfile')
var contents = jsonFile.readFileSync("smartAssetQuery.json");
//var GetQuery= contents.query;
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Configure and create 
var config = {
  userName: 'XXXX', 
  password: 'XXXX', 
  server: 'XXXX', 
   options:{ 
    database: 'XXXXX', 
    encrypt: true
  }
}
var connection = new Connection(config);

// set up the database connection
connection.on('connect', function(err) 
   {
     if (err) 
       {
          console.log(err)
       }
    else
       {
          console.log('Connected to database!')
          // queryDatabase()
       }
   }
 );

/*connect the bot to my node js server*/  
var connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector);

/*Integrate LUIS framework with bode js server*/
const LuisModelUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/470b8f15-fcbf-4898-96e6-8e75bb7cc901?subscription-key=b32c3c902efa422e8ba42e9164de50a5&verbose=true&timezoneOffset=0&q=';

var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);  
var intents = new builder.IntentDialog({ recognizers: [recognizer] })

.matches('Greetings',(session,args)=>{
  session.send('Hello');
})

.matches('Reliability',[
  function(session,args){
    session.send('How would you like to know about Reliability?');
    //session.send('1. Failure\n2. Health\n3. Downtime');
    builder.Prompts.number(session,'1. Failure\n2. Health\n3. Downtime');
  },function(session){
      if(session.message.text==1){
      session.send('Please tell me what would you would like to ask about Asset Failure?');
    }
    else if (session.message.text==2) {
      session.send('Please tell me what would you would like to ask about Asset Health?');
    }
    else if (session.message.text==3){
      session.send('Please tell me what would you would like to ask about Asset Downtime?');
    }
}
])

.matches('Performance',(session,args)=>{
  session.send('inside Performance');

/*  var countryEntity= builder.EntityRecognizer.findEntity(args.entities,'country');
  console.log(countryEntity.entity);
  request.on('row', function(columns) {
        columns.forEach(function(column) {
         //  console.log("%s\t%s", column.metadata.colName, column.value);
        session.send("%s\t%s", column.metadata.colName, column.value)
         });
             });
    
connection.execSql(request);
*/
})
/*updated for file trial ver#01*/
/*Author:Suryadeep*/
.matches('FailureCount',[
  function(session,args){
  //	var entityFailurecount=builder.EntityRecognizer.findEntity(args.entities,'entityNamePseudo');
   // var entityFailureCountName= entityCountry.entity;
  //  var IntentFailureCountName= entityCountry.intent;
  //  var entityRealValue= entityCountry.resolution.values[0];
   var PassQuery;
 	for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="FailureCount") {
			PassQuery=contents[i].query;
		}
 	}
    global.requestCountFailure = new Request(
          //"SELECT COUNT(DISTINCT(DIM_WRK_ORDR.WRK_ORDR_SK)) FROM FCT_WRK_ORDR_DTLS INNER JOIN  DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY= DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) WHERE [DIM_WRK_ORDR].[WORK_TYPE]='Breakdown' OR [DIM_WRK_ORDR].[WORK_TYPE]='Corrective'",
          	PassQuery,
          function(err, rowCount, rows) {
            if (err) {
              console.log('Error in Failure count intent');
            }
          }
    );
    requestCountFailure.on('row', function(columns) {
      columns.forEach(function(column) {
         //  console.log("%s\t%s", column.metadata.colName, column.value);
      session.send("%s\t%s", column.metadata.colName, column.value)
      });
    });
    connection.execSql(requestCountFailure);
  },function(session){
      session.send('what else would you like to know?');
  }
])


.matches('FailurecountCountry',[
  function(session,args){
    var entityCountry=builder.EntityRecognizer.findEntity(args.entities,'country');
    var entityCountryName= entityCountry.entity;
    var entityRealValue= entityCountry.resolution.values[0];

    console.log(entityRealValue)
    console.log(entityCountry)
    var PassQuery;
 	for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="FailurecountCountry") {
			PassQuery=contents[i].query;
		}
 	}
    global.requestCountFailureCountry = new Request(
      
        
    //    "SELECT COUNT(DISTINCT(DIM_WRK_ORDR.WRK_ORDR_SK)) FROM FCT_WRK_ORDR_DTLS INNER JOIN  DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY= DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) WHERE ([DIM_WRK_ORDR].[WORK_TYPE]='Breakdown' OR [DIM_WRK_ORDR].[WORK_TYPE]='Corrective')AND DIM_LCTN.CNTRY=@entityCountryName",
     //   "SELECT COUNT(DISTINCT(DIM_WRK_ORDR.WRK_ORDR_SK)) FROM FCT_WRK_ORDR_DTLS INNER JOIN  DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY= DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) WHERE ([DIM_WRK_ORDR].[WORK_TYPE]='Breakdown' OR [DIM_WRK_ORDR].[WORK_TYPE]='Corrective')AND DIM_LCTN.CNTRY=@value",
       PassQuery,
       function(err, rowCount, rows) {
          if (err) {
              console.log(err);
          }
        }
  );
   requestCountFailureCountry.addParameter('value',TYPES.NVarChar,entityCountry.entity);
requestCountFailureCountry.on('row', function(columns) {
    columns.forEach(function(column) {
         //  console.log("%s\t%s", column.metadata.colName, column.value);
    session.send("%s\t%s", column.metadata.colName, column.value)
    });
  });
  connection.execSql(requestCountFailureCountry);
  }
])
.matches('FailurecountOrganization',[
    function(session,args){
      var entityOrgName=builder.EntityRecognizer.findEntity(args.entities,'org');
        var PassQuery;
       	for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="FailurecountOrganization") {
			PassQuery=contents[i].query;
		}
 	}
      global.requestCountFailureOrg = new Request(
          //""
          PassQuery,
          function(err,rowCount,rows){
            if (err) {
              console.log('Error in Failure count org');
            } 
          }
        );
      requestCountFailureOrg.addParameter('value',TYPES.NVarChar,entityOrgName.entity);
requestCountFailureOrg.on('row', function(columns) {
    columns.forEach(function(column) {
         //  console.log("%s\t%s", column.metadata.colName, column.value);
    session.send("%s\t%s", column.metadata.colName, column.value)
    });
  });
  connection.execSql(requestCountFailureOrg);
    }
  ])
/*LUIS handling not yet done*/
.matches('TopfailedAssetName',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="TopfailedAssetName") {
			PassQuery=contents[i].query;
		}
 	}
    global.requestCountTopFailureName = new Request(
          //"SELECT TOP 3 DIM_ASSET.ASST_DESC, COUNT(Distinct(DIM_WRK_ORDR.WRK_ORDR_SK)) FROM FCT_WRK_ORDR_DTLS INNER JOIN  DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY= DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) where [DIM_WRK_ORDR].[WORK_TYPE]='Breakdown' OR [DIM_WRK_ORDR].[WORK_TYPE]='Corrective' GROUP BY [DIM_ASSET].[ASST_DESC] ORDER BY COUNT(Distinct(DIM_WRK_ORDR.WRK_ORDR_SK)) DESC",
          PassQuery,
          function(err,rowCount,rows){
            if (err) {
              console.log('Error in Failure count org');
            } 
          }
        );
requestCountTopFailureName.on('row', function(columns) {
    columns.forEach(function(column) {
         //  console.log("%s\t%s", column.metadata.colName, column.value);
    session.send("%s\t%s", column.metadata.colName, column.value)
    });
  });
  connection.execSql(requestCountTopFailureName);
  }
])

.matches('TopfailedCategories',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="TopfailedCategories") {
			PassQuery=contents[i].query;
		}
 	}  	
     global.requestCountTopFailureCat = new Request(
          //"SELECT TOP 3 DIM_ASSET.ASST_CAT, COUNT(Distinct(DIM_WRK_ORDR.WRK_ORDR_SK)) FROM FCT_WRK_ORDR_DTLS INNER JOIN  DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY= DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) where [DIM_WRK_ORDR].[WORK_TYPE]='Breakdown' OR [DIM_WRK_ORDR].[WORK_TYPE]='Corrective' GROUP BY [DIM_ASSET].[ASST_CAT] ORDER BY COUNT(Distinct(DIM_WRK_ORDR.WRK_ORDR_SK)) DESC",
          PassQuery,
          function(err,rowCount,rows){
            if (err) {
              console.log('Error in Failure count org');
            } 
          }
        );
requestCountTopFailureCat .on('row', function(columns) {
    columns.forEach(function(column) {
         //  console.log("%s\t%s", column.metadata.colName, column.value);
    session.send("%s\t%s", column.metadata.colName, column.value)
    });
  });
  connection.execSql(requestCountTopFailureCat );
  }
])

.matches('TopfailedTypes',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="TopfailedTypes") {
			PassQuery=contents[i].query;
		}
 	}    	
        global.requestCountTopFailureType = new Request(
        //  "SELECT TOP 3 DIM_ASSET.ASST_TYPE, COUNT(Distinct(DIM_WRK_ORDR.WRK_ORDR_SK)) FROM FCT_WRK_ORDR_DTLS INNER JOIN  DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY= DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) where [DIM_WRK_ORDR].[WORK_TYPE]='Breakdown' OR [DIM_WRK_ORDR].[WORK_TYPE]='Corrective' GROUP BY [DIM_ASSET].[ASST_TYPE] ORDER BY COUNT(Distinct(DIM_WRK_ORDR.WRK_ORDR_SK)) DESC",
          PassQuery,
          function(err,rowCount,rows){
            if (err) {
              console.log('Error in Failure count org');
            } 
          }
        );
requestCountTopFailureType.on('row', function(columns) {
    columns.forEach(function(column) {
         //  console.log("%s\t%s", column.metadata.colName, column.value);
    session.send("%s\t%s", column.metadata.colName, column.value)
    });
  });
  connection.execSql(requestCountTopFailureType);
  }
])

/*start edidting here*/
/*Author: SUryadeep*/
/*12/4/2017:5:32PM*/
.matches('FailureCost',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="FailureCost") {
			PassQuery=contents[i].query;
		}
 	}  	
    global.requestFailureCost=new Request(
    //  "select sum(FCT_WRK_ORDR_DTLS.ACTUAL_MNTNCE_COST) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) where DIM_WRK_ORDR.WORK_TYPE = 'Breakdown' or DIM_WRK_ORDR.WORK_TYPE = 'Corrective' ",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestFailureCost.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestFailureCost);
    }
  ])

.matches('AssetDowntimeHours',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="AssetDowntimeHours") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestAssetDowntimeHours=new Request(
    //  "select sum(datediff(day,DIM_WRK_ORDR.Actual_Start_Dt,DIM_WRK_ORDR.Actual_Finish_Dt))*9 FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) ",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestAssetDowntimeHours.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestAssetDowntimeHours);
    }
  ])

.matches('PurchaseCost',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="PurchaseCost") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestPurchaseCost=new Request(
    //  "select sum(DIM_ASSET.ASST_PURCHASE_COST) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=1 ",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestPurchaseCost.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestPurchaseCost);
    }
  ])
.matches('OperatingAssets',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="OperatingAssets") {
			PassQuery=contents[i].query;
		}
 	}  
    global.requestOperatingAssets=new Request(
    //  " select count (distinct(DIM_ASSET.ASST_SK)) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=1 ",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestOperatingAssets.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestOperatingAssets);
    }
  ])

.matches('AssetPurchaseDateCount',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="AssetPurchaseDateCount") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestAssetPurchaseDateCount=new Request(
    //  "select count (distinct(DIM_ASSET.ASST_SK)) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=1 and Year(DIM_ASSET.ASST_PURCHASE_DT)= 2012 ",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestAssetPurchaseDateCount.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestAssetPurchaseDateCount);
    }
  ])

.matches('AssetCatWiseValue',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="AssetCatWiseValue") {
			PassQuery=contents[i].query;
		}
 	}  	
    global.requestAssetCatWiseValue=new Request(
    //  "select DIM_ASSET.ASST_CAT, sum(DIM_ASSET.ASST_PURCHASE_COST) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=1 and year(DIM_ASSET.ASST_PURCHASE_DT)=2013 group by DIM_ASSET.ASST_CAT ",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestAssetCatWiseValue.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestAssetCatWiseValue);
    }
  ])

.matches('AssetTypeWiseValue',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="AssetTypeWiseValue") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestAssetTypeWiseValue=new Request(
    //  "select DIM_ASSET.ASST_TYPE, sum(DIM_ASSET.ASST_PURCHASE_COST) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=1 and year( DIM_ASSET.ASST_PURCHASE_DT)=2013 group by DIM_ASSET.ASST_TYPE ",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestAssetTypeWiseValue.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestAssetTypeWiseValue);
    }
  ])

.matches('AssetDeptWiseValue',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="AssetDeptWiseValue") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestAssetDeptWiseValue=new Request(
     // "select DIM_DEPARTMENT.DEPARTMENT, sum(DIM_ASSET.ASST_PURCHASE_COST) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=1 and year( DIM_ASSET.ASST_PURCHASE_DT)=2013 group by DIM_DEPARTMENT.DEPARTMENT ",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestAssetDeptWiseValue.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestAssetDeptWiseValue);
    }
  ])

.matches('AssetCountryWiseValue',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="AssetCountryWiseValue") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestAssetCountryWiseValue=new Request(
    //  "select DIM_LCTN.CNTRY, sum(DIM_ASSET.ASST_PURCHASE_COST) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN  DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK = DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK = DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK = DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=1 and Year(DIM_ASSET.ASST_PURCHASE_DT)=2013 group by DIM_LCTN.CNTRY ",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestAssetCountryWiseValue.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestAssetCountryWiseValue);
    }
  ])
  .matches('WOCurrYear',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="WOCurrYear") {
			PassQuery=contents[i].query;
		}
 	}    	
    global.requestWOCurrYear=new Request(
    //  "select count(distinct (DIM_WRK_ORDR.WRK_ORDR_SK)) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_WRK_ORDR_DTLS.LCTN_SK_KEY = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (FCT_WO_MAT_TRANS.ITEM_SK = DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=1 and DIM_DATE.CALENDAR_YEAR_NBR=2016",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestWOCurrYear.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestWOCurrYear);
    }
  ])
 .matches('WOEmergency',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="WOEmergency") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestWOEmergency=new Request(
    //  "select count(distinct (DIM_WRK_ORDR.WRK_ORDR_SK)) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY = DIM_ASSET.ASST_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_WRK_ORDR_DTLS.LCTN_SK_KEY = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY = FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (FCT_WO_MAT_TRANS.ITEM_SK = DIM_ITEM.ITEM_SK) where DIM_WRK_ORDR.WORK_ORDER_PRIORITY_NBR=4 --and DIM_DATE.CALENDAR_YEAR_NBR=2016",
    PassQuery,  
    function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestWOEmergency.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestWOEmergency);
    }
  ])

/*Second Update starts here*/
/*Author:Suryadeep*/
 .matches('BreakdownWOCount',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="BreakdownWOCount") {
			PassQuery=contents[i].query;
		}
 	}    	
    global.requestBreakdownWOCount=new Request(
    //  "select DIM_WRK_ORDR.WORK_TYPE, count(distinct (DIM_WRK_ORDR.WRK_ORDR_SK)) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN  DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY =DIM_ASSET.ASST_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_WRK_ORDR_DTLS.LCTN_SK_KEY =DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY=FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (FCT_WO_MAT_TRANS.ITEM_SK = DIM_ITEM.ITEM_SK) where DIM_DATE.CALENDAR_YEAR_NBR= 2016 and DIM_WRK_ORDR.WORK_TYPE='Breakdown' group by DIM_WRK_ORDR.WORK_TYPE",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestBreakdownWOCount.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestBreakdownWOCount);
    }
  ])

  .matches('AssetDecomissionCount',[
  function(session,args){
  	var PassQuery;
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="AssetDecomissionCount") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestAssetDecomissionCount=new Request(
    //  "select count (distinct(DIM_ASSET.ASST_SK)) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY =DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK =DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON ( DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK = DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS  ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY = DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK =DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK =DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=0 and year(DIM_ASSET.ASST_DCMSN_DT)=2016",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestAssetDecomissionCount.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestAssetDecomissionCount);
    }
  ])

    .matches('AssetDecomissionValue',[
  function(session,args){
  	var PassQuery; 	
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="AssetDecomissionValue") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestAssetDecomissionValue=new Request(
    //  "select sum(DIM_ASSET.ASST_PURCHASE_COST) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY =DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK =DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK = DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE  ON ( FCT_ASST_FAILURE .FAILURE_SK =DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY =DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK =DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK =DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=0 and year(DIM_ASSET.ASST_DCMSN_DT)=2016",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestAssetDecomissionValue.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestAssetDecomissionValue);
    }
  ])

    .matches('SoldAssetCount',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="SoldAssetCount") {
			PassQuery=contents[i].query;
		}
 	}  	
    global.requestSoldAssetCount=new Request(
    //  "select count(distinct (dim_asset.asst_sk)) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY =DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORD RDIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER  ON (DIM_ASSET.SPPLR_SK =DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK =DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE  ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK =DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY =DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK =DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK =DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=0 and year(DIM_ASSET.ASST_DCMSN_DT)=2016 and DIM_ASSET.DCMSN_TYPE='SELL'",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestSoldAssetCount.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestSoldAssetCount);
    }
  ])

  .matches('SoldAssetValue',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="SoldAssetValue") {
			PassQuery=contents[i].query;
		}
 	} 
    global.requestSoldAssetValue=new Request(
    //  "select sum(DIM_ASSET.ASST_PURCHASE_COST) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY =DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (DIM_ASSET.LCTN_SK = DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK=FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK = FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK=DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK =DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK =DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY =DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK =DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK =DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=0 and year(DIM_ASSET.ASST_DCMSN_DT)=2016 and DIM_ASSET.DCMSN_TYPE='SELL'",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestSoldAssetValue.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestSoldAssetValue);
    }
  ]) 

      .matches('DecomissionedAssetValueByType',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="DecomissionedAssetValueByType") {
			PassQuery=contents[i].query;
		}
 	}  	
    global.requestDecomissionedAssetValueByType=new Request(
    //  "select DIM_ASSET.DCMSN_TYPE, sum(DIM_ASSET.ASST_PURCHASE_COST) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY =DIM_ASSET.ASST_SK) INNER JOIN DIM_LCTN DIM_LCTN ON ( DIM_ASSET.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_LBR_TRNS_DTS.WRK_ORDR_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_ASSET.SPPLR_SK =DIM_SUPPLIER.SPPLR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK =DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_ASST_FAILURE FCT_ASST_FAILURE ON (DIM_WRK_ORDR.WRK_ORDR_SK =FCT_ASST_FAILURE.WO_SK) INNER JOIN DIM_FAILURE DIM_FAILURE ON (FCT_ASST_FAILURE.FAILURE_SK =DIM_FAILURE.FAILURE_SK) INNER JOIN FCT_ASSET_STATUS FCT_ASSET_STATUS ON (DIM_WRK_ORDR.WRK_ORDR_SK=FCT_ASSET_STATUS.WRK_ORDR_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY =DIM_DATE.DATE_SK) INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_WO_MAT_TRANS.INVENTORY_SK =DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (DIM_INVENTORY.ITEM_SK =DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=0 and year(DIM_ASSET.ASST_DCMSN_DT)=2016 group by DIM_ASSET.DCMSN_TYPE",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestDecomissionedAssetValueByType.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestDecomissionedAssetValueByType);
    }
  ]) 

      .matches('UnplannedWOCount',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="UnplannedWOCount") {
			PassQuery=contents[i].query;
		}
 	}  	
    global.requestUnplannedWOCount=new Request(
    //  "select count(distinct (DIM_WRK_ORDR.WRK_ORDR_SK)) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY =DIM_ASSET.ASST_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY =DIM_DATE.DATE_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_WRK_ORDR_DTLS.LCTN_SK_KEY =DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK =DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (FCT_WO_MAT_TRANS.ITEM_SK =DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=1 and DIM_DATE.CALENDAR_YEAR_NBR=2016 and DIM_WRK_ORDR.WORK_TYPE='Breakdown' or DIM_WRK_ORDR.WORK_TYPE='Corrective'",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestUnplannedWOCount.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestUnplannedWOCount);
    }
  ]) 
      .matches('TotMaintenCost',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="TotMaintenCost") {
			PassQuery=contents[i].query;
		}
 	}  	  	
    global.requestTotMaintenCost=new Request(
    //  "select sum(FCT_WRK_ORDR_DTLS.ACTUAL_MNTNCE_COST) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY =DIM_ASSET.ASST_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY =DIM_DATE.DATE_SK) INNER JOIN DIM_LCTN DIM_LCTN  ON (FCT_WRK_ORDR_DTLS.LCTN_SK_KEY =DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK =DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (FCT_WO_MAT_TRANS.ITEM_SK=DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=1 and DIM_DATE.CALENDAR_YEAR_NBR=2016 and DIM_WRK_ORDR.WORK_TYPE='Breakdown' or DIM_WRK_ORDR.WORK_TYPE='Corrective'",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestTotMaintenCost.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestTotMaintenCost);
    }
  ]) 
      .matches('MaintenanceByWorkType',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="MaintenanceByWorkType") {
			PassQuery=contents[i].query;
		}
 	}    	
    global.requestMaintenanceByWorkType=new Request(
    //  "select DIM_WRK_ORDR.WORK_TYPE, sum(FCT_WRK_ORDR_DTLS.ACTUAL_MNTNCE_COST) FROM FCT_WRK_ORDR_DTLS FCT_WRK_ORDR_DTLS INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_WRK_ORDR_DTLS.ASST_SK_KEY =DIM_ASSET.ASST_SK) INNER JOIN DIM_DATE DIM_DATE ON (FCT_WRK_ORDR_DTLS.DATE_SK_KEY =DIM_DATE.DATE_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_WRK_ORDR_DTLS.LCTN_SK_KEY =DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_ASSET.DEPT_SK =DIM_DEPARTMENT.DEPT_SK) INNER JOIN FCT_WO_MAT_TRANS FCT_WO_MAT_TRANS ON (FCT_WRK_ORDR_DTLS.WRK_ORDR_SK_KEY =FCT_WO_MAT_TRANS.WRK_ORDR_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (FCT_WO_MAT_TRANS.ITEM_SK =DIM_ITEM.ITEM_SK) where DIM_ASSET.ASST_STTS_IND=1 and DIM_DATE.CALENDAR_YEAR_NBR=2016  group BY DIM_WRK_ORDR.WORK_TYPE",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestMaintenanceByWorkType.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestMaintenanceByWorkType);
    }
  ]) 

      .matches('LabourCount',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="LabourCount") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestLabourCount=new Request(
    //  " select count (distinct(dim_labour.lbr_sk)) FROM FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS INNER JOIN DIM_DATE DIM_DATE ON (FCT_LBR_TRNS_DTS.DATE_SK =DIM_DATE.DATE_SK) INNER JOIN DIM_LABOUR DIM_LABOUR ON (FCT_LBR_TRNS_DTS.LBR_SK =DIM_LABOUR.LBR_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_LBR_TRNS_DTS.LCTN_SK=DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_LBR_TRNS_DTS.WRK_ORDR_SK =DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_LBR_TRNS_DTS.ASST_SK =DIM_ASSET.ASST_SK) INNER JOIN DIM_CRAFT DIM_CRAFT ON (DIM_LABOUR.CRAFT_SK =DIM_CRAFT.CRAFT_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_LABOUR.DEPT_SK =DIM_DEPARTMENT.DEPT_SK) INNER JOIN DIM_SKILL DIM_SKILL ON (DIM_LABOUR.SKILL_SK =DIM_SKILL.SKILL_SK) where DIM_LABOUR.STATUS='ACTIVE'",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestLabourCount.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestLabourCount);
    }
  ]) 
      .matches('LabourExpense',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="LabourExpense") {
			PassQuery=contents[i].query;
		}
 	}    	
    global.requestLabourExpense=new Request(
    //  " select sum(FCT_LBR_TRNS_DTS.labor_trx_cost) FROM FCT_LBR_TRNS_DTS FCT_LBR_TRNS_DTS INNER JOIN DIM_DATE DIM_DATE ON (FCT_LBR_TRNS_DTS.DATE_SK =DIM_DATE.DATE_SK) INNER JOIN DIM_LABOUR DIM_LABOUR ON (FCT_LBR_TRNS_DTS.LBR_SK =DIM_LABOUR.LBR_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_LBR_TRNS_DTS.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_LBR_TRNS_DTS.WRK_ORDR_SK =DIM_WRK_ORDR.WRK_ORDR_SK) INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_LBR_TRNS_DTS.ASST_SK =DIM_ASSET.ASST_SK) INNER JOIN DIM_CRAFT DIM_CRAFT ON (DIM_LABOUR.CRAFT_SK =DIM_CRAFT.CRAFT_SK) INNER JOIN DIM_DEPARTMENT DIM_DEPARTMENT ON (DIM_LABOUR.DEPT_SK =DIM_DEPARTMENT.DEPT_SK) INNER JOIN DIM_SKILL DIM_SKILL ON (DIM_LABOUR.SKILL_SK =DIM_SKILL.SKILL_SK) where DIM_LABOUR.STATUS='ACTIVE' and DIM_DATE.CALENDAR_YEAR_NBR=2016",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestLabourExpense.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestLabourExpense);
    }
  ]) 
      .matches('SupplierScore',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="SupplierScore") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestSupplierScore=new Request(
    //  "select AVG(dim_supplier.performance_score) FROM FCT_INVOICE_LN FCT_INVOICE_LN INNER JOIN DIM_INVOICE DIM_INVOICE ON (FCT_INVOICE_LN.INVOICE_SK =DIM_INVOICE.INVOICE_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (DIM_INVOICE.SPPLR_SK =DIM_SUPPLIER.SPPLR_SK) LEFT JOIN DIM_ITEM DIM_ITEM ON (FCT_INVOICE_LN.ITEM_SK =DIM_ITEM.ITEM_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_INVOICE_LN.LCTN_SK =DIM_LCTN.LCTN_SK) LEFT JOIN DIM_INVENTORY DIM_INVENTORY ON ((DIM_ITEM.ITEM_SK =DIM_INVENTORY.ITEM_SK) AND (DIM_LCTN.LCTN_SK =DIM_INVENTORY.LCTN_SK) AND (FCT_INVOICE_LN.SPPLR_SK =DIM_INVENTORY.SPPLR_SK)) LEFT JOIN DIM_ASSET DIM_ASSET ON (FCT_INVOICE_LN.ASSET_SK=DIM_ASSET.ASST_SK)",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestSupplierScore.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestSupplierScore);
    }
  ]) 

      .matches('BankruptcyScore',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="BankruptcyScore") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestBankruptcyScore=new Request(
    //  "select count(DIM_SRV_RQST.SRVC_RQST_SK) FROM FCT_SRV_REQ FCT_SRV_REQ INNER JOIN DIM_DATE DIM_DATE ON (FCT_SRV_REQ.DATE_SK =DIM_DATE.DATE_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_SRV_REQ.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_SRV_RQST DIM_SRV_RQST ON (FCT_SRV_REQ.SRV_REQ_FSKEY =DIM_SRV_RQST.SRVC_RQST_SK) INNER JOIN DIM_SRV_RQST_TYP DIM_SRV_RQST_TYP ON (DIM_SRV_RQST.SRVC_RQST_TYP =DIM_SRV_RQST_TYP.SRQ_TYP_SK) INNER JOIN DIM_SRV_RQST_CAT DIM_SRV_RQST_CAT ON (DIM_SRV_RQST_TYP.SRQ_SK=DIM_SRV_RQST_CAT.SRQ_SK) INNER JOIN DIM_ASSET DIM_ASSET ON ( FCT_SRV_REQ.ASST_SK =DIM_ASSET.ASST_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_SRV_REQ.WRK_ORDR_SK =DIM_WRK_ORDR.WRK_ORDR_SK) where (year(DIM_SRV_RQST.ISSUE_REPORTED_DT)=2016)",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestBankruptcyScore.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestBankruptcyScore);
    }
  ])


      .matches('ServiceReqCount',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="ServiceReqCount") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestServiceReqCount=new Request(
//    "select count(DIM_SRV_RQST.SRVC_RQST_SK) FROM FCT_SRV_REQ FCT_SRV_REQ INNER JOIN DIM_DATE DIM_DATE ON (FCT_SRV_REQ.DATE_SK =DIM_DATE.DATE_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_SRV_REQ.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_SRV_RQST DIM_SRV_RQST ON (FCT_SRV_REQ.SRV_REQ_FSKEY =DIM_SRV_RQST.SRVC_RQST_SK) INNER JOIN DIM_SRV_RQST_TYP DIM_SRV_RQST_TYP ON (DIM_SRV_RQST.SRVC_RQST_TYP =DIM_SRV_RQST_TYP.SRQ_TYP_SK) INNER JOIN DIM_SRV_RQST_CAT DIM_SRV_RQST_CAT ON (DIM_SRV_RQST_TYP.SRQ_SK=DIM_SRV_RQST_CAT.SRQ_SK) INNER JOIN DIM_ASSET DIM_ASSET ON ( FCT_SRV_REQ.ASST_SK =DIM_ASSET.ASST_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_SRV_REQ.WRK_ORDR_SK =DIM_WRK_ORDR.WRK_ORDR_SK) where (year(DIM_SRV_RQST.ISSUE_REPORTED_DT)=2016)",
  PassQuery,
   function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestServiceReqCount.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestServiceReqCount);
    }
  ])  

      .matches('EmergServiceReqCount',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="EmergServiceReqCount") {
			PassQuery=contents[i].query;
		}
 	}   	
    global.requestEmergServiceReqCount=new Request(
    // "select count(DIM_SRV_RQST.SRVC_RQST_SK) FROM FCT_SRV_REQ FCT_SRV_REQ INNER JOIN DIM_DATE DIM_DATE  ON ( FCT_SRV_REQ.DATE_SK =DIM_DATE.DATE_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_SRV_REQ.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_SRV_RQST DIM_SRV_RQST ON (FCT_SRV_REQ.SRV_REQ_FSKEY =DIM_SRV_RQST.SRVC_RQST_SK) INNER JOIN DIM_SRV_RQST_TYP DIM_SRV_RQST_TYP ON (DIM_SRV_RQST.SRVC_RQST_TYP =DIM_SRV_RQST_TYP.SRQ_TYP_SK) INNER JOIN DIM_SRV_RQST_CAT DIM_SRV_RQST_CAT ON (DIM_SRV_RQST_TYP.SRQ_SK =DIM_SRV_RQST_CAT.SRQ_SK) INNER JOIN DIM_ASSET DIM_ASSET ON (FCT_SRV_REQ.ASST_SK =DIM_ASSET.ASST_SK) INNER JOIN DIM_WRK_ORDR DIM_WRK_ORDR ON (FCT_SRV_REQ.WRK_ORDR_SK =DIM_WRK_ORDR.WRK_ORDR_SK) where year(DIM_SRV_RQST.ISSUE_REPORTED_DT)=2016 and DIM_SRV_RQST.SRVC_RQST_PRRTY_CD=4",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestEmergServiceReqCount.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestEmergServiceReqCount);
    }
  ]) 
      .matches('InventorySpend',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="InventorySpend") {
			PassQuery=contents[i].query;
		}
 	}  	
    global.requestInventorySpend=new Request(
    //  "  select sum(FCT_INVENTORY_TRANS.TRANSACTION_AMT) FROM FCT_INVENTORY_TRANS FCT_INVENTORY_TRANS INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_INVENTORY_TRANS.INVENTORY_SK =DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_INVENTORY_TRANS.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_ITEM DIM_ITEM ON ( FCT_INVENTORY_TRANS.ITEM_SK =DIM_ITEM.ITEM_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (FCT_INVENTORY_TRANS.SPPLR_SK =DIM_SUPPLIER.SPPLR_SK) where FCT_INVENTORY_TRANS.TRANSACTION_TYPE='WDRAWITEM' and year(FCT_INVENTORY_TRANS.TRANSACTION_DT)=2016",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestInventorySpend.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestInventorySpend);
    }
  ]) 
       .matches('PurchasedInventoryCount',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="PurchasedInventoryCount") {
			PassQuery=contents[i].query;
		}
 	}    	
    global.requestPurchasedInventoryCount=new Request(
    //  "  select sum(FCT_INVENTORY_TRANS.TRANSACTION_QTY) FROM FCT_INVENTORY_TRANS FCT_INVENTORY_TRANS INNER JOIN DIM_INVENTORY DIM_INVENTORY  ON ( FCT_INVENTORY_TRANS.INVENTORY_SK =DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_INVENTORY_TRANS.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (FCT_INVENTORY_TRANS.ITEM_SK=DIM_ITEM.ITEM_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (FCT_INVENTORY_TRANS.SPPLR_SK =DIM_SUPPLIER.SPPLR_SK) where FCT_INVENTORY_TRANS.TRANSACTION_TYPE='INSERTITEM' and year(FCT_INVENTORY_TRANS.TRANSACTION_DT)=2016",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestPurchasedInventoryCount.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestPurchasedInventoryCount);
    }
  ])      
       .matches('PurchasedInventoryAmt',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="PurchasedInventoryAmt") {
			PassQuery=contents[i].query;
		}
 	}    	
    global.requestPurchasedInventoryAmt=new Request(
    //  "select sum(FCT_INVENTORY_TRANS.TRANSACTION_AMT) FROM FCT_INVENTORY_TRANS FCT_INVENTORY_TRANS INNER JOIN DIM_INVENTORY DIM_INVENTORY ON (FCT_INVENTORY_TRANS.INVENTORY_SK =DIM_INVENTORY.INVENTORY_ITEM_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_INVENTORY_TRANS.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_ITEM DIM_ITEM ON (FCT_INVENTORY_TRANS.ITEM_SK=DIM_ITEM.ITEM_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (FCT_INVENTORY_TRANS.SPPLR_SK=DIM_SUPPLIER.SPPLR_SK) where FCT_INVENTORY_TRANS.TRANSACTION_TYPE='INSERTITEM' and year(FCT_INVENTORY_TRANS.TRANSACTION_DT)=2016",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestPurchasedInventoryAmt.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestPurchasedInventoryAmt);
    }
  ])      
       .matches('SafetyStock',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="SafetyStock") {
			PassQuery=contents[i].query;
		}
 	}    	
    global.requestSafetyStock=new Request(
    //  "select avg(DIM_INVENTORY.SAFETY_STOCK_QUANTITY) FROM FCT_INVENTORY_TRANS FCT_INVENTORY_TRANS INNER JOIN DIM_INVENTORY DIM_INVENTORY ON ( FCT_INVENTORY_TRANS.INVENTORY_SK=DIM_INVENTORY . INVENTORY_ITEM_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_INVENTORY_TRANS.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_ITEM DIM_ITEM ON ( FCT_INVENTORY_TRANS.ITEM_SK=DIM_ITEM.ITEM_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (FCT_INVENTORY_TRANS.SPPLR_SK =DIM_SUPPLIER.SPPLR_SK)",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in failure cost');
          }
        }
      );
    requestSafetyStock.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestSafetyStock);
    }
  ])   

       .matches('TotMaintenCostUnplanned',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="TotMaintenCostUnplanned") {
			PassQuery=contents[i].query;
		}
 	}    	
    global.requestTotMaintenCostUnplanned=new Request(
    //  "select avg(DIM_INVENTORY.SAFETY_STOCK_QUANTITY) FROM FCT_INVENTORY_TRANS FCT_INVENTORY_TRANS INNER JOIN DIM_INVENTORY DIM_INVENTORY ON ( FCT_INVENTORY_TRANS.INVENTORY_SK=DIM_INVENTORY . INVENTORY_ITEM_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_INVENTORY_TRANS.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_ITEM DIM_ITEM ON ( FCT_INVENTORY_TRANS.ITEM_SK=DIM_ITEM.ITEM_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (FCT_INVENTORY_TRANS.SPPLR_SK =DIM_SUPPLIER.SPPLR_SK)",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in requestTotMaintenCostUnplanned');
          }
        }
      );
    requestTotMaintenCostUnplanned.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestTotMaintenCostUnplanned);
    }
  ])   

       .matches('WorkTypeWO',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="WorkTypeWO") {
			PassQuery=contents[i].query;
		}
 	}    	
    global.requestWorkTypeWO=new Request(
    //  "select avg(DIM_INVENTORY.SAFETY_STOCK_QUANTITY) FROM FCT_INVENTORY_TRANS FCT_INVENTORY_TRANS INNER JOIN DIM_INVENTORY DIM_INVENTORY ON ( FCT_INVENTORY_TRANS.INVENTORY_SK=DIM_INVENTORY . INVENTORY_ITEM_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_INVENTORY_TRANS.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_ITEM DIM_ITEM ON ( FCT_INVENTORY_TRANS.ITEM_SK=DIM_ITEM.ITEM_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (FCT_INVENTORY_TRANS.SPPLR_SK =DIM_SUPPLIER.SPPLR_SK)",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in requestWorkTypeWO');
          }
        }
      );
    requestWorkTypeWO.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestWorkTypeWO);
    }
  ])  
       .matches('UsedInventoryCount',[
  function(session,args){
  	var PassQuery; 
    for(var i=0;i<contents.length;++i){
		if (contents[i].intent=="UsedInventoryCount") {
			PassQuery=contents[i].query;
		}
 	}    	
    global.requestUsedInventoryCount=new Request(
    //  "select avg(DIM_INVENTORY.SAFETY_STOCK_QUANTITY) FROM FCT_INVENTORY_TRANS FCT_INVENTORY_TRANS INNER JOIN DIM_INVENTORY DIM_INVENTORY ON ( FCT_INVENTORY_TRANS.INVENTORY_SK=DIM_INVENTORY . INVENTORY_ITEM_SK) INNER JOIN DIM_LCTN DIM_LCTN ON (FCT_INVENTORY_TRANS.LCTN_SK =DIM_LCTN.LCTN_SK) INNER JOIN DIM_ITEM DIM_ITEM ON ( FCT_INVENTORY_TRANS.ITEM_SK=DIM_ITEM.ITEM_SK) INNER JOIN DIM_SUPPLIER DIM_SUPPLIER ON (FCT_INVENTORY_TRANS.SPPLR_SK =DIM_SUPPLIER.SPPLR_SK)",
      PassQuery,
      function(err,rowCount,rows){
        if (err) {
          console.log('Error in requestUsedInventoryCount');
          }
        }
      );
    requestUsedInventoryCount.on('row',function(columns){
      columns.forEach(function(column){
        session.send("%s\t%s",column.metadata.colName,column.value)
       });
      });
    connection.execSql(requestUsedInventoryCount);
    }
  ])


.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
       //session.send(LuisModelUrl);
     
});

bot.dialog('/',intents);
