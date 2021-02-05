
const Alexa = require('ask-sdk-core');

//Estas son la variables globales que ayudan a mantener los datos guardados durante la sesion//
var resultado, nombre, grado, numRandom;
var numPreguntas = 0, numRandomPasado = 0, racha = 0, intentos = 0, aciertos = 0;
var speechTextPrimero = "";



const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        
        return handlerInput.responseBuilder.
            speak('Bienvenido. En esta skill te haré algunas preguntas de cálculo mental. Suerte').
            withSimpleCard('Bienvenido. ¡Vamos a aprender!').
            addDelegateDirective({
                name: 'InicioIntent',
                confirmationStatus: 'NONE',
                slots: {}
            }).getResponse();
    }
};


const InicioIntentHandler = {
    canHandle(handlerInput) { 
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'InicioIntent';
    },
    handle(handlerInput) {
        
        //(handlerInput.requestEnvelope.request.intent.slots.tiempo.value)*2; //le damos el doble del valor ingresado (30 segs por pregunta = 1 minuto, dos preguntas);
        
        grado = handlerInput.requestEnvelope.request.intent.slots.grado.value;
        
        nombre = handlerInput.requestEnvelope.request.intent.slots.nombre.value;
        
         // = '¡Hola ' + nombre + " comencemos!";
        
        speechTextPrimero = generadorPregunta();
        numPreguntas++;
        
        if(supportsAPL(handlerInput) ){
            
            return handlerInput.responseBuilder.speak('Hola ' + nombre + '. <break time="1s"/> Este es el primer problema... <break time="1s"/>' + speechTextPrimero + '<break time="1s"/>')
            .reprompt('No te entendí... Este es el primer problema... <break time="1s"/>' + speechTextPrimero + '<break time="1s"/>'). 
            addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                 document: require('./pantalla.json'),
                  dataSources: {
                	"type": "Header",
                	"title": {
                    'value': 'Hello World'
                    },
                	
                }}).
                getResponse();
            
        }else{
            return handlerInput.responseBuilder.speak('Hola ' + nombre + '. <break time="1s"/> Este es el primer problema... <break time="1s"/>' + speechTextPrimero + '<break time="1s"/>')
                .reprompt('No te entendí... Este es el primer problema... <break time="1s"/>' + speechTextPrimero + '<break time="1s"/>'). 
                getResponse();
        }
            
    }
};


const RespuestaIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RespuestaIntent';
    },
    handle(handlerInput) {

   var getNumber = handlerInput.requestEnvelope.request.intent.slots.numero.value; // esto es el umero que recibo desde alexa
   // aqui controla si hemos acertado con el numero 
                var speechText, retroalimentacion;
               // if(resultado == getNumber){
                
               
                if(parseInt(resultado) == parseInt(getNumber)){
                    racha++;
                    aciertos++;
                    numPreguntas++;
                    intentos = 0;
                    if ((racha % 4) == 0){   
                        
                       retroalimentacion =  '<break time="1s"/> <say-as interpret-as="interjection">wuórales</say-as>' + '<break time="1s"/> llevas una racha de ' + racha + ' respuestas correctas. <break time="1s"/>'
                        
                    }else{
                        retroalimentacion = 'Perfecto! <break time="1s"/>'; 
                    }
                     
                   if (parseInt(numPreguntas) !== 8){
                        speechTextPrimero =   generadorPregunta();
                        
                        if(supportsAPL(handlerInput) ){
                            return handlerInput.responseBuilder.speak( retroalimentacion + 'El siguiente problema es... <break time="1s"/> ' + speechTextPrimero ).
                            addDirective({
                            type: 'Alexa.Presentation.APL.RenderDocument',
                            version: '1.0',
                            document: require('./pantalla.json'),
                            datasources: {},} ).
                            reprompt('No te entendí... La pregunta es... <break time="1s"/> ' + speechTextPrimero).
                            getResponse();
                        }else{
                            return handlerInput.responseBuilder.speak( retroalimentacion + 'El siguiente problema es... <break time="1s"/> ' + speechTextPrimero ).getResponse();
                        }
                    }
                    else{
                        numPreguntas = 0;
                        speechTextPrimero = "pregunta";
                        
                        if(supportsAPL(handlerInput) ){
                            return handlerInput.responseBuilder.speak(retroalimentacion + '¿Quieres más preguntas?').
                            addDirective({
                            type: 'Alexa.Presentation.APL.RenderDocument',
                            version: '1.0',
                            document: require('./pantalla.json'),
                            datasources: {},} ).
                            reprompt('No te entendí... ¿Quieres más preguntas?').
                            getResponse("¿Quieres más preguntas?");
                        }else{
                            return handlerInput.responseBuilder.speak(retroalimentacion + '¿Quieres más preguntas?').
                            reprompt('No te entendí... ¿Quieres más preguntas?').
                            getResponse("¿Quieres más preguntas?");
                        }
                    }
                }
                else{
                    racha = 0;
                    intentos++;
                    retroalimentacion =  'Te falló por muy poco, ' + ' Intentalo de nuevo... '+ 'La pregunta es... <break time="1s"/> ' + speechTextPrimero + '...'; 
                     if (parseInt(numPreguntas) !== 8){
                         if(intentos == 2){
                             intentos = 0;
                             retroalimentacion = 'La respuesta del problema era ' + resultado + '. suerte en los proximos problemas. <break time="1s"/>';
                             speechTextPrimero = generadorPregunta();
                             
                            if(supportsAPL(handlerInput) ){
                                return handlerInput.responseBuilder.speak(retroalimentacion +' El siguiente problema es... <break time="1s"/> ' + speechTextPrimero + '<break time="1s"/>').
                                addDirective({
                                type: 'Alexa.Presentation.APL.RenderDocument',
                                version: '1.0',
                                document: require('./pantalla.json'),
                                datasources: {},} ).
                                reprompt(retroalimentacion +' El siguiente problema es... <break time="1s"/> ' + speechTextPrimero + '<break time="1s"/>').
                                getResponse();
                            }else{
                               return handlerInput.responseBuilder.speak(retroalimentacion +' El siguiente problema es... <break time="1s"/> ' + speechTextPrimero + '<break time="1s"/>').
                                reprompt(retroalimentacion +' El siguiente problema es... <break time="1s"/> ' + speechTextPrimero + '<break time="1s"/>').
                                getResponse(); 
                            }
                        }
                        if(supportsAPL(handlerInput) ){
                            return handlerInput.responseBuilder.speak(retroalimentacion).
                            addDirective({
                            type: 'Alexa.Presentation.APL.RenderDocument',
                            version: '1.0',
                            document: require('./pantalla.json'),
                            datasources: {},} ).
                            reprompt(retroalimentacion).
                            getResponse();
                        }else{
                            return handlerInput.responseBuilder.speak(retroalimentacion).
                            reprompt(retroalimentacion).
                            getResponse();    
                        }
                    }
                    else{
                        numPreguntas = 0;
                        speechTextPrimero = "pregunta";
                        
                        if(supportsAPL(handlerInput) ){
                            return handlerInput.responseBuilder.speak('¿Quieres más preguntas?').
                            addDirective({
                            type: 'Alexa.Presentation.APL.RenderDocument',
                            version: '1.0',
                            document: require('./pantalla.json'),
                            datasources: {},} ).
                            reprompt('No te entendí... ¿Quieres más preguntas?').
                            getResponse();
                        }else{
                            return handlerInput.responseBuilder.speak('¿Quieres más preguntas?').
                            reprompt('No te entendí... ¿Quieres más preguntas?').
                            getResponse();
                        }
                    }
                        
                }
            }
                     
};


const SiguienteIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SiguienteIntent';
    },
    handle(handlerInput) {
        var speechText, retroalimentacion;
        racha = 0;
        intentos = 0;
        retroalimentacion = 'La respuesta del problema era ' + resultado + '. suerte en los proximos problemas. <break time="1s"/>';
        speechTextPrimero = generadorPregunta();
        
        if(supportsAPL(handlerInput) ){
            return handlerInput.responseBuilder.speak(retroalimentacion +' El siguiente problema es... <break time="1s"/> ' + speechTextPrimero + '<break time="1s"/>').
            addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            version: '1.0',
            document: require('./pantalla.json'),
            datasources: {},} ).
            reprompt('No te entendí... La pregunta es... <break time="1s"/> ' + speechTextPrimero).
            getResponse();
        }else{
            return handlerInput.responseBuilder.speak(retroalimentacion +' El siguiente problema es... <break time="1s"/> ' + speechTextPrimero + '<break time="1s"/>').
            reprompt('No te entendí... La pregunta es... <break time="1s"/> ' + speechTextPrimero).
            getResponse();
        }
    }
        
};

const MasPreguntasIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MasPreguntasIntent';
    },
    handle(handlerInput) {
        numPreguntas = 0;
        speechTextPrimero = generadorPregunta();
        
        if(supportsAPL(handlerInput) ){
            return handlerInput.responseBuilder.speak('Sigamos!' + '.  El siguiente problema es... <break time="1s"/>' + speechTextPrimero + '<break time="1s"/>').
            addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            version: '1.0',
            document: require('./pantalla.json'),
            datasources: {},} ).
            reprompt('No te entendí... La pregunta es... <break time="1s"/> ' + speechTextPrimero).
            getResponse();  
        }else{
            return handlerInput.responseBuilder.speak('Sigamos!' + '.  El siguiente problema es... <break time="1s"/>' + speechTextPrimero + '<break time="1s"/>').
            reprompt('No te entendí... La pregunta es... <break time="1s"/> ' + speechTextPrimero).
            getResponse();  
        }
        
        
    }
        
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'En esta skill te haré preguntas de cálculo mental. Para empezar a aprender debes decir tu nombre... luego preguntaré en que grado de primaria estas. <break time="1s"/> Para terminar solo debes decir, cierra o ya me canse.';
        if (speechTextPrimero == ""){
            return handlerInput.responseBuilder
            .speak(speechText).addDelegateDirective({
            name: 'InicioIntent',
            confirmationStatus: 'NONE',
            slots: {}
            })
            .reprompt(speechText)
            .withSimpleCard(speechTextPrimero)
            .getResponse();
        }else if (speechTextPrimero == "pregunta"){
            
            if(supportsAPL(handlerInput) ){
                return handlerInput.responseBuilder.
                speak('Si quieres mas preguntas solo debes decir si o claro. Si la pregunta es muy difícil puedes decir, pasa a la siguiente pregunta. Para salir de la skill solo debes decir, cierra o ya me cansé.').
                addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./pantalla.json'),
                datasources: {},} ).
                reprompt('Si quieres mas preguntas solo debes decir si o claro. Si la pregunta es muy difícil puedes decir, pasa a la siguiente pregunta. Para salir de la skill solo debes decir, cierra o ya me cansé.').
                getResponse();
            }else{
                return handlerInput.responseBuilder.
                speak('Si quieres mas preguntas solo debes decir si o claro. Si la pregunta es muy difícil puedes decir, pasa a la siguiente pregunta. Para salir de la skill solo debes decir, cierra o ya me cansé.').
                reprompt('Si quieres mas preguntas solo debes decir si o claro. Si la pregunta es muy difícil puedes decir, pasa a la siguiente pregunta. Para salir de la skill solo debes decir, cierra o ya me cansé.').
                getResponse();
            }
            
        }else{
            
            if(supportsAPL(handlerInput) ){
                return handlerInput.responseBuilder.
                speak('El juego ya empezó, solo debes decir la respuesta de la pregunta. Si la pregunta es muy difícill puedes decir, pasa a la siguiente pregunta. Para salir de la skill solo debes decir, cierra o ya me cansé. <break time="1s"/> Esta es la pregunta... ' + speechTextPrimero ).
                addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./pantalla.json'),
                datasources: {},} ).
                reprompt('El juego ya empezó, solo debes decir la respuesta de la pregunta. Si la pregunta es muy difícil puedes decir, pasa a la siguiente pregunta. Para salir de la skill solo debes decir, cierra o ya me cansé. <break time="1s"/> Esta es la pregunta... ' + speechTextPrimero ).
                getResponse();
            }else{
                return handlerInput.responseBuilder.
                speak('El juego ya empezó, solo debes decir la respuesta de la pregunta. Si la pregunta es muy difícill puedes decir, pasa a la siguiente pregunta. Para salir de la skill solo debes decir, cierra o ya me cansé. <break time="1s"/> Esta es la pregunta... ' + speechTextPrimero ).
                reprompt('El juego ya empezó, solo debes decir la respuesta de la pregunta. Si la pregunta es muy difícil puedes decir, pasa a la siguiente pregunta. Para salir de la skill solo debes decir, cierra o ya me cansé. <break time="1s"/> Esta es la pregunta... ' + speechTextPrimero ).
                getResponse();
            }
            
        }
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        
    var speechText = ' Hoy aprendiste mucho... tuviste ' + aciertos + ' aciertos...  Vuelve pronto para seguir aprendiendo';
    numPreguntas = 0, numRandomPasado = 0, racha = 0, intentos = 0, aciertos = 0;
    speechTextPrimero = "";
    
    if (speechTextPrimero == ""){
        
        if(supportsAPL(handlerInput) ){
            return handlerInput.responseBuilder.
            speak('Vuelve pronto para seguir aprendiendo').
            addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            version: '1.0',
            document: require('./pantalla.json'),
            datasources: {},} ).
            reprompt('El juego ya empezó, solo debes decir la respuesta de la pregunta. Si la pregunta es muy difícil puedes decir, pasa a la siguiente pregunta. Para salir de la skill solo debes decir, cierra o ya me cansé. <break time="1s"/> Esta es la pregunta... ' + speechTextPrimero ).
            getResponse();
        }else{
            return handlerInput.responseBuilder.
            speak('Vuelve pronto para seguir aprendiendo').
            getResponse();
        }
        
            
    }else{
        
        return handlerInput.responseBuilder.
        speak(nombre + speechText).
        getResponse();
        }
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Lo siento, No pude escuchar lo que dijiste. intentalo de nuevo.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

/*================================functions================================*/

function generadorPregunta(){
     var speechText, x, y;
    
        switch(grado) {
        case '1.º': 
            numRandom = getRandomInt(1,10);
            while(numRandom == numRandomPasado){
             numRandom = getRandomInt(1,10);  
            }
            numRandomPasado = numRandom;
            
            switch(numRandomPasado) {
                case 1://series de números hacia adelante
                   x = getRandomInt(10,30);
                    speechText = 'Vamos a contar juntos... <break time="1s"/>'  + x + ', <break time="1s"/> ' + (x+1) + ', <break time="1s"/> '+ (x+2) + ', <break time="1s"/> ¿Cuál es el siguiente número?';
                    resultado = (x+3);
                    return speechText;
               
                case 2://series de números hacia atrás
                    x = getRandomInt(10,30);
                    speechText = 'Vamos a contar juntos... <break time="1s"/>' + x + ', <break time="1s"/>' + (x-1) + ', <break time="1s"/>'+ (x-2) + ', <break time="1s"/>¿Cuál es el siguiente número?';
                   resultado = (x-3);
                   return speechText;
            
                case 3://sumas iguales de múltiplos de 5 con texto 
                    x = getRandomInt(5,15);
                    while ((x % 5) !== 0) {
                      x = getRandomInt(5,15);
                    }
                    
                     speechText = '¿Cuánto es ' + x + ' mas ' + x + ' ?';
                    resultado = (x*2);
                    return speechText;
             
                case 4://sumas de un número grande y uno pequeño múltiplos de 2
                    x = getRandomInt(10,20);
                    while ((x % 2) !== 0) {
                        x = getRandomInt(10,20);
                    }
                    
                    y = getRandomInt(1, 10);
                    while ((y % 2) !== 0) {
                        y = getRandomInt(1,10);
                    }
                    
                     speechText = '¿Cuánto es ' + x + ' mas ' + y + ' ?';
                    resultado = (x + y);
                    return speechText;
            
                case 5://restas dentro de los primeros 20 números que son multiplos de 5
                    x = getRandomInt(10,20);
                     while ((x % 5) !== 0) {
                        x = getRandomInt(10,20);
                    }
                    y = getRandomInt(1,10);
                      while ((y % 5) !== 0) {
                        y = getRandomInt(1,10);
                    }
                    
                    speechText = 'Si le quitas ' + y + ' a ' + x + ' ¿Cuánto te queda?';
                    resultado = (x - y);
                    return speechText;
                 
                case 6://restas dentro de los primeros 16 números de pares
                   x = getRandomInt(8,16);
                    while ((x % 2) !== 0) {
                      x = getRandomInt(8,16);
                    }
                    y = getRandomInt(1,6);
                    while ((y % 2) !== 0) {
                      y = getRandomInt(1,6);
                    }
                    
                    speechText =  x + ' menos ' + y ;
                    resultado = (x - y);
                    return speechText;
                
                case 7://sumas de números iguales  
                    x = getRandomInt(5, 20);
                    while ((x % 5) !== 0) {
                      x = getRandomInt(5,20);
                    }
                    
                    speechText =  x + ' mas ' + x ;
                    resultado = (x + x);
                    return speechText;
             
                case 8://restas de un número grande y uno pequeño 
                    x = getRandomInt(10,25);
                    y = getRandomInt(1,3);
                    
                    speechText =  x + ' menos ' + y;
                    resultado = (x - y);
                    return speechText;
               
                case 9://sumas de pares dentro de los primeros 10 números  
                    x = getRandomInt(1,10);
                    while ((x % 2) !== 0) {
                      x = getRandomInt(1,10);
                    }
                    y = getRandomInt(1,10);
                    while ((y % 2) !== 0) {
                      y = getRandomInt(1,10);
                    }
                    
                    speechText = x + ' mas ' + y;
                    resultado = (x + y);
                    return speechText;
                
                case 10://sumas de un número grande y uno pequeño 
                    x = getRandomInt(15,30);
                    y = getRandomInt(1,3);
                    
                    speechText =  x + ' mas ' + y;
                    resultado = (x + y);
                    return speechText;
                
            }
           break;
           
       case '2.º':
            numRandom = getRandomInt(1,10);
            while(numRandom == numRandomPasado){
            numRandom = getRandomInt(1,10);  
            }
            numRandomPasado = numRandom;
            
            switch(numRandomPasado) {
                case 1://sumas de numeros pares menores de 10
                    x = getRandomInt(1,10);
                    while ((x % 2) !== 0) {
                      x = getRandomInt(1,10);
                    }
                    y = getRandomInt(1,10);
                    while ((y % 2) !== 0) {
                      y = getRandomInt(1,10);
                    }
                    
                    speechText = x + ' mas ' + y;
                    resultado = (x + y);
                    return speechText;
               
                case 2://sumas de tres datos iguales múltiplos de 5
                    x = getRandomInt(5,10);
                    while ((x % 5) !== 0) {
                      x = getRandomInt(5,10);
                    }
                    
                    speechText =  x + ' mas ' + x + '<break time="1s"/> ' + ' mas' + x ;
                    resultado = (x*3);
                    return speechText;
            
                case 3://sumas de un número grande y uno pequeño múltiplos de 10
                    x = getRandomInt(10,90);
                    while ((x % 10) !== 0) {
                        x = getRandomInt(10,20);
                    }
                    
                        y = 10;
                    
                    
                    speechText =  x + ' mas ' + y ;
                    resultado = (x + y);
                    return speechText;
             
                case 4://sumas de un número grande multiplo de 10 y uno menor a 10 múltiplo de 2
                    x = getRandomInt(10,50);
                    while ((x % 10) !== 0) {
                        x = getRandomInt(10,50);
                    }
                    
                    y = getRandomInt(1, 9);
                    while ((y % 2) !== 0) {
                        y = getRandomInt(1,9);
                    }
                    
                     speechText =  x + ' mas ' + y ;
                    resultado = (x + y);
                    return speechText;
            
                case 5://restas dentro de los primeros 20 números
                    x = getRandomInt(10,20);
                     while ((x % 10) !== 0) {
                        x = getRandomInt(10,20);
                    }
                    y = getRandomInt(1,10);
                    
                    speechText =  x + ' menos ' + y;
                    resultado = (x - y);
                    return speechText;
                 
                case 6://sumas de centenares
                   x = getRandomInt(100,800);
                    while ((x % 100) !== 0) {
                      x = getRandomInt(100,800);
                    }
                    y = getRandomInt(100,200);
                    while ((y % 100) !== 0) {
                      y = getRandomInt(100,200);
                    }
                    
                    speechText =  x + ' mas ' + y ;
                    resultado = (x + y);
                    return speechText;
                
                case 7://Resta de un multiplo de 10  menos 10
                    x = getRandomInt(10, 100);
                    while ((x % 10) !== 0) {
                      x = getRandomInt(10,100);
                    }
                    
                    y = 10;
                    
                    speechText =  x + ' menos ' + y ;
                    resultado = (x - y);
                    return speechText;
             
                case 8://restas de el modulo de un numero 
                    x = getRandomInt(10,60);
                    while ((x % 10) == 0) {
                      x = getRandomInt(10,60);
                    }
                    y = x % 10;
                    
                    speechText =  x + ' menos ' + y;
                    resultado = (x - y);
                    return speechText;
               
                case 9://restas multiplos de 50
                    x = getRandomInt(101,300);
                    while ((x % 50) !== 0) {
                      x = getRandomInt(101,300);
                    }
                    y = getRandomInt(50,100);
                    while ((y % 50) !== 0) {
                      y = getRandomInt(50,100);
                    }
                    
                    speechText = x + ' menos ' + y;
                    resultado = (x - y);
                    return speechText;
                
                case 10://sumas de un número grande y uno pequeño 
                    x = getRandomInt(1,90);
                    y = 10;
                    
                    speechText =  x + ' mas ' + y;
                    resultado = (x + y);
                    return speechText;
                
            }
           break;
            
            case '3.º': 
            numRandom = getRandomInt(1,10);
            while(numRandom == numRandomPasado){
            numRandom = getRandomInt(1,10);  
            }
            numRandomPasado = numRandom;
            switch(numRandomPasado) {
                case 1://sumas numeros diferentes múltiplos de 3 y de 2
                    x = getRandomInt(15,30);
                    while ((x % 2) !== 0) {
                      x = getRandomInt(15,30);
                    }
                    y = getRandomInt(3,9);
                    while ((y % 3) !== 0) {
                      y = getRandomInt(3,9);
                    }
					
                    speechText =  x + ' mas ' + y ;
                    resultado = x+y;
                    return speechText;
               
                case 2://restas multiplos de 5 con texto 
                    x = getRandomInt(40,60);
                    while ((x % 5) !== 0) {
                      x = getRandomInt(40,60);
                    }
                    y = getRandomInt(20,30);
                    while ((y % 5) !== 0) {
                      y = getRandomInt(20, 30);
                    }
                    speechText = '¿Cuánto le falta a ' + y + ' para llegar a ' + x + ' ?';
                    resultado = x-y;
                    return speechText;
            
                case 3://restas de múltiplos de 5 con un 10
                    x = getRandomInt(20,100);
                    while ((x % 5) !== 0) {
                      x = getRandomInt(20,100);
                    }
                    y = 10;
					
                    speechText = x + ' menos ' + y ;
                    resultado = x-y;
                    return speechText;
             
                case 4://sumas de números pares  
                    x = getRandomInt(30, 60);
                    while ((x % 2) !== 0) {
                      x = getRandomInt(30, 60);
                    }
					
					y = getRandomInt(2,16);
                    while ((y % 2) !== 0) {
                      y = getRandomInt(2,16);
                    }
					
                    speechText =  x + ' mas ' + y ;
                    resultado = x + y;
                    return speechText
            
                case 5://restas de un multiplo de 10 con números impares 
                    x = getRandomInt(10,100);
                    while ((x % 10) !== 0) {
                      x = getRandomInt(10,100);
                    }
                    y = getRandomInt(5, 13);
                    while ((y % 1) !== 0) {
                      y = getRandomInt(5, 13);
                    }
					
                    speechText = x + ' menos ' + y ;
                    resultado = x-y;
                    return speechText;
                 
                case 6://series de números de tercias hacia adelante
                   x = getRandomInt(50,80);
                    speechText = '¿Qué número sigue de esta serie?... <break time="1s"/>'  + (x+3) + ', <break time="1s"/> ' + (x+6) + ', <break time="1s"/> '+ (x+9) +', <break time="1s"/> ¿Cuál es el siguiente número?';
                    resultado = (x+12);
                    return speechText;
                
                case 7://series de números pares hacia atrás
                   x = getRandomInt(50,100);
                    speechText = '¿Qué número sigue de esta serie?... <break time="1s"/>'  + (x-2) + ', <break time="1s"/> ' + (x-4) + ', <break time="1s"/> '+ (x-6) +', <break time="1s"/> ¿Cuál es el siguiente número?';
                    resultado = (x-8);
                    return speechText;
             
                case 8://multiplicación de números pares 
                    x = getRandomInt(1, 10);
                    while ((x % 2) !== 0) {
                      x = getRandomInt(1, 10);
                    }
					
					y = getRandomInt(1, 10);
                    while ((y % 2) !== 0) {
                      y = getRandomInt(1, 10);
                    }
					
                    speechText =  x + ' por ' + y ;
                    resultado = x * y;
                    return speechText
               
                case 9://multiplicación de números nones 
                    x = getRandomInt(1, 10);
                    while ((x % 1) !== 0) {
                      x = getRandomInt(1, 10);
                    }
					
					y = getRandomInt(1, 10);
                    while ((y % 1) !== 0) {
                      y = getRandomInt(1, 10);
                    }
					
                    speechText =  x + ' por ' + y ;
                    resultado = x * y;
                    return speechText               
                  
                default:
                
                break;
                
            }
            break;
                
            case '4.º':
                numRandom = getRandomInt(1,10);
                while(numRandom == numRandomPasado){
                 numRandom = getRandomInt(1,10);  
                }
                numRandomPasado = numRandom;
            
                switch(numRandomPasado) {
                    case 1://sumas numeros diferentes múltiplos de 100 
                        x = getRandomInt(100,2000);
                        while ((x % 100) !== 0) {
                          x = getRandomInt(100,2000);
                        }
                        y = getRandomInt(100,500);
                        while ((y % 100) !== 0) {
                          y = getRandomInt(100,500);
                        }
    					
                        speechText =  x + ' mas ' + y ;
                        resultado = x+y;
                        return speechText;
                   
                    case 2://restas a cien
                        x = 100;
                        y = getRandomInt(50,95);
                        
    					speechText =  x + ' menos ' + y ;
                        resultado = x-y;
                        return speechText;
                
                    case 3://multiplicación de multiplos de 10 con números pares
                        x = getRandomInt(10, 100);
                        while ((x % 10) !== 0) {
                          x = getRandomInt(10, 100);
                        }
    					
    					y = getRandomInt(2, 10);
                        while ((y % 2) !== 0) {
                          y = getRandomInt(2, 10);
                        }
    					
                        speechText =  x + ' por ' + y ;
                        resultado = x * y;
                        return speechText
                 
                    case 4://divisiones de pares entre dos  
                         x = getRandomInt(1, 50);
                        while ((x % 2) !== 0) {
                          x = getRandomInt(1, 50);
                        }
    					
    					y = 2;
    					
                        speechText =  x + ' entre ' + y ;
                        resultado = x / y;
                        return speechText
                
                    case 5://divisiones de multiplos de 10 entre cuatro  
                         x = getRandomInt(10, 50);
                        while ((x % 10) !== 0) {
                          x = getRandomInt(10, 50);
                        }
    					
    					y = 4;
    					
                        speechText =  x + ' entre ' + y ;
                        resultado = x / y;
                        return speechText
                     
                    case 6://sumas de decimales multiplos de .5
    					x = getRandomInt(1, 10);
    					x = x + 0.5;
    					
    					y = 0.5;
    					
                        speechText =  x + ' mas ' + y ;
                        resultado = x+y;
                        return speechText;
                    
                    case 7://sumas de decimales multiplos de .2
    					x = getRandomInt(1, 10);
    					
    					y = 0.2;
    					
                        speechText =  x + ' mas ' + y ;
                        resultado = x+y;
                        return speechText;
                 
                    case 8://sumas de decimales multiplos de .3
    					x = getRandomInt(1, 10);
    					x = x + 0.3;
    					
    					y = getRandomInt(1, 5);
    					
                        speechText =  x + ' mas ' + y ;
                        resultado = x+y;
                        return speechText;
                   
                    case 9://divisiones de numeros grandes multiplos de 10 entre 10  
                         x = getRandomInt(100, 1000);
                        while ((x % 10) !== 0) {
                          x = getRandomInt(100, 1000);
                        }
    					
    					y = 10;
    					
                        speechText =  x + ' entre ' + y ;
                        resultado = x / y;
                        return speechText 
    					
    				case 10://restas de numeros grandes con multiplos de 2  
                         x = getRandomInt(100, 1000);
                        while ((x % 10) !== 0) {
                          x = getRandomInt(100, 1000);
                        }
    					
    					y = getRandomInt(100, 300);;
    					while ((y % 2) !== 0) {
                          y = getRandomInt(100, 300);
                        }
    										
                        speechText = '¿Cuánto le falta a ' + y + ' para llegar a ' + x + ' ?';
                        resultado = x-y;
                        return speechText;				
                      
                    default:
                    
                    break;
                    
                }
            break;
          case '5.º':
                numRandom = getRandomInt(1,10);
                while(numRandom == numRandomPasado){
                 numRandom = getRandomInt(1,10);  
                }
                numRandomPasado = numRandom;
            
                switch(numRandomPasado) {
                    case 1://sumas numeros diferentes múltiplos de 100 
                        x = getRandomInt(100,2000);
                        while ((x % 100) !== 0) {
                          x = getRandomInt(100,2000);
                        }
                        y = getRandomInt(100,500);
                        while ((y % 100) !== 0) {
                          y = getRandomInt(100,500);
                        }
    					
                        speechText =  x + ' mas ' + y ;
                        resultado = x+y;
                        return speechText;
                   
                    case 2://restas a cien
                        x = getRandomInt(40,60);
                        while ((x % 5) !== 0) {
                          x = getRandomInt(40,60);
                        }
                        y = getRandomInt(20,30);
                        while ((y % 5) !== 0) {
                          y = getRandomInt(20, 30);
                        }
                        speechText = '¿Cuánto le falta a ' + y + ' para llegar a ' + x + ' ?';
                        resultado = x-y;
                        return speechText;
                
                    case 3://multiplicación de multiplos de 10 con números pares
                        x = getRandomInt(1,80);
                        speechText = '¿Qué número sigue de esta serie?... <break time="1s"/>'  + (x*2) + ', <break time="1s"/> ' + (x*4) + ', <break time="1s"/> '+ (x*8) +', <break time="1s"/> ¿Cuál es el siguiente número?';
                        resultado = (x*16);
                        return speechText;
                     
                    case 4://divisiones de pares entre dos  
                         x = getRandomInt(1, 50);
                        while ((x % 2) !== 0) {
                          x = getRandomInt(1, 50);
                        }
    					
    					y = 2;
    					
                        speechText =  x + ' entre ' + y ;
                        resultado = x / y;
                        return speechText
                
                    case 5://divisiones de multiplos de 10 entre cuatro  
                         x = getRandomInt(10, 50);
                        while ((x % 10) !== 0) {
                          x = getRandomInt(10, 50);
                        }
    					
    					y = 4;
    					
                        speechText =  x + ' entre ' + y ;
                        resultado = x / y;
                        return speechText
                     
                    case 6://sumas de decimales multiplos de .5
    					x = getRandomInt(1, 10);
    					x = x + 0.5;
    					
    					y = 0.5;
    					
                        speechText =  x + ' mas ' + y ;
                        resultado = x+y;
                        return speechText;
                    
                    case 7://sumas de decimales multiplos de .2
    					x = getRandomInt(1, 10);
    					
    					y = 0.2;
    					
                        speechText =  x + ' mas ' + y ;
                        resultado = x+y;
                        return speechText;
                 
                    case 8://sumas de decimales multiplos de .3
    					x = getRandomInt(1, 10);
    					x = x + 0.3;
    					
    					y = getRandomInt(1, 5);
    					
                        speechText =  x + ' mas ' + y ;
                        resultado = x+y;
                        return speechText;
                   
                    case 9://divisiones de numeros grandes multiplos de 10 entre 10  
                         x = getRandomInt(100, 1000);
                        while ((x % 10) !== 0) {
                          x = getRandomInt(100, 1000);
                        }
    					
    					y = 10;
    					
                        speechText =  x + ' entre ' + y ;
                        resultado = x / y;
                        return speechText 
    					
    				case 10://restas de numeros grandes con multiplos de 2  
                         x = getRandomInt(100, 1000);
                        while ((x % 10) !== 0) {
                          x = getRandomInt(100, 1000);
                        }
    					
    					y = getRandomInt(100, 300);;
    					while ((y % 2) !== 0) {
                          y = getRandomInt(100, 300);
                        }
    										
                        speechText = '¿Cuánto le falta a ' + y + ' para llegar a ' + x + ' ?';
                        resultado = x-y;
                        return speechText;				
                      
                    default:
                    
                    break;
                    
                }
            break;
            case '6.º':
                numRandom = getRandomInt(1,10);
                while(numRandom == numRandomPasado){
                 numRandom = getRandomInt(1,10);  
                }
                numRandomPasado = numRandom;
            
            switch(numRandomPasado) {
                case 1://multiplicacion y suma
                   x = getRandomInt(1,60);
                   while ((x % 5) !== 0) {
                      x = getRandomInt(1,60);
                    }
                     y = getRandomInt(1, 30);
                    while ((y % 5) !== 0) {
                        y = getRandomInt(1,30);
                    }
                    speechText = x + ' por cuatro<break time="1s"/> mas ' + y ;
                    resultado = (x*4) + y;   
                    return speechText;
               
                case 2://numero menor a 30 por mil
                    x = getRandomInt(1,30);
                    y = 1000
                    
                    speechText = x + ' por ' + y ;
                    resultado = (x*y);   
                    return speechText;
                case 3://miles con sobrante menos ese sobrante
                    x = getRandomInt(1000,9999);
                    while ((x % 1000) == 0) {
                      x = getRandomInt(1000,9999);
                    }
                    y = x % 1000;
                    
                    speechText =  x + ' menos ' + y;
                    resultado = (x - y);
                    return speechText;
             
                case 4://sumas de decimales multiplos de .75
    					x = getRandomInt(1, 10);
    					x = x + 0.75;
    					
    					y = 0.25;
    					
                        speechText =  x + ' mas ' + y ;
                        resultado = x+y;
                        return speechText;
            
                case 5://restas dentro de los primeros 20 números que son multiplos de 5
                    x = getRandomInt(1,20);
                     while ((x % 2) !== 0) {
                        x = getRandomInt(1,20);
                    }
                    y = getRandomInt(.1, .9);
                      while ((y % .2) !== 0) {
                        y = getRandomInt(.1, .9);
                    }
                        x = x + y;
                    
                    speechText = 'La mitad de ' + x;
                    resultado = (x/2);
                    return speechText;
                 
                case 6://restas dentro de los primeros 16 números de pares
                   x = getRandomInt(100, 1000);
                    while ((x % 100) !== 0) {
                      x = getRandomInt(100, 1000);
                    }
                    y = getRandomInt(10,50);
                    while ((y % 10) !== 0) {
                      y = getRandomInt(10,50);
                    }
                    
                    speechText =  x + ' entre ' + y ;
                    resultado = (x / y);
                    return speechText;
                
                case 7://sumas de decimales multiplos de .2
    					x = getRandomInt(1, 50);
    					
    					y = 0.2;
    					
                        speechText =  x + ' mas ' + y ;
                        resultado = x+y;
                        return speechText;
                 
                    case 8://sumas de decimales multiplos de .3
    					x = getRandomInt(1, 50);
    					x = x + 0.3;
    					
    					y = getRandomInt(1, 15);
    					
                        speechText =  x + ' mas ' + y ;
                        resultado = x+y;
                        return speechText;
                   
                    case 9://divisiones de numeros grandes multiplos de 10 entre 10  
                         x = getRandomInt(100, 5000);
                        while ((x % 10) !== 0) {
                          x = getRandomInt(100, 5000);
                        }
    					
    					y = 10;
    					
                        speechText =  x + ' entre ' + y ;
                        resultado = x / y;
                        return speechText 
    					
    				case 10://restas de numeros grandes con multiplos de 2  
                         x = getRandomInt(100, 5000);
                        while ((x % 10) !== 0) {
                          x = getRandomInt(100, 5000);
                        }
    					
    					y = getRandomInt(100, 900);;
    					while ((y % 2) !== 0) {
                          y = getRandomInt(100, 900);
                        }
    										
                        speechText = '¿Cuánto le falta a ' + y + ' para llegar a ' + x + ' ?';
                        resultado = x-y;
                        return speechText;
                
            }
           break;
        
        }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
//This function it is use tu see if the divice supports APL
function supportsAPL(handlerInput) { 
  const supportedInterfaces = 
  handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return aplInterface != null && aplInterface != undefined; 
}

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        InicioIntentHandler,
        RespuestaIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SiguienteIntentHandler,
        MasPreguntasIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
    
