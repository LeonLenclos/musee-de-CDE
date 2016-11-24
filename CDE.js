//    //  //   //   /////  //////  //////
///  ///  //   //  //      //      //
// // //  //   //   ////   ////    ////
//    //  //   //      //  //      //
//    //   /////   /////   //////  //////

////    //////
//  //  //
//  //  ////
//  //  //
////    //////

 /////  ////    //////
//      //  //  //
//      //  //  ////
//      //  //  //
 /////  ////    //////

// Léon Lenclos
// Novembre 2016

// leonlenclos.net
// leon.lenclos@gmail.com

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////    INNITIALISATIONS VARIABLES    //////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//pref
var GRAVITE =1;
var JUMP = 10;
var HAUTEUR_MIN_CDE = 60;
var UNE_SCEONDE = 50;
var ecart = 150; // entre les CDE

//
var LARGEUR_SCENE =4000; // ça varie
var HAUTEUR_SCENE =2183;
var couleurMur;

//objets p5.play
var sol;
var man;
var spe;

//var man
var direction=1;
var auSol; // bol
var contreLeMur= false;
var ilParle = false;
var ilDanse = false;
var danseMouvement=1; // actuel mouvemeent de danse
var nbDanseMouvement = 3; // (combien de mouvement de danse disponnibles)
var tetelevee = false;
var chosesDite =""; // ce qui dois etre dit
var speed = 3; //vitesse marche

//
var entreDansLaPorte = null; //dans quelle porte il entre
var estEnTrainDePasserLaPorte = false;
var sallesVisitees = []; //historique

//
var loading = true;

//
var musee; //json
var salle;//json
var obj =[];//array pour recevoir des 'ObjetMusee' cf: ObjetMusee.js

// HTML elements
var h;//dom
var nav;//dom
var aHelp;
var aAbout;
var cnv;// canvas (dom)
var divBulle; //dom
var footer; //dom

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////     FONCTIONS P5   ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//P5 PRELOAD charge les animations le musee.json et la font
function preload () {
	//On récupère toutes les infos sur le contenu du musee
	musee = loadJSON('musee.json');

	//C'est un objet p5.play qui servira pour les moments un peu speciaux...
	spe = createSprite(30,HAUTEUR_SCENE-70,1000,HAUTEUR_SCENE);
	spe.addAnimation('NUMENBOY',"img/numenboy/1.png","img/numenboy/6.png");
	spe.addAnimation('DANSE',"img/dancefloor/1.png");
	spe.animation.frameDelay = 1;

	//C'est un objet p5.play qui est enfait le guide
	man = createSprite(100,200,120,120);
	man.addAnimation('MARCHE', "img/marche/1.png", "img/marche/8.png");
	man.addAnimation('MARCHETETELEVEE', "img/marchetetelevee/1.png", "img/marchetetelevee/8.png");
	man.addAnimation('ARRET', "img/arret/1.png");
	man.addAnimation('SAUT', "img/saut/1.png", "img/saut/3.png");
	man.addAnimation('LEVELATETE', "img/levelatete/2.png");
	for (var i = 1; i <=nbDanseMouvement; i++) {
		man.addAnimation('DANSE'+i, "img/danse/"+i+"1.png", "img/danse/"+i+"9.png");
	}
	man.animation.frameDelay = 5;


}

//P5 SETUP innitialise les ellements html et appelle la fonction intallerLaSalle
function setup() {

	//DOM
	h = createElement('h1', musee.extra.titre);
	nav = createElement('nav');
	nav.child(aAbout = createA('CDE-about.html','À propos'));
	aAbout.attribute('target','_blank');
	nav.child(createSpan(' | '));
	nav.child(aHelp = createA('CDE-help.html','Aide'));
	aHelp.attribute('target','_blank');

	divBulle = createDiv('loading...');
	cnv =  createCanvas();
	footer = createElement('footer', musee.extra.footer);

	//on resize le canvas
	var cnvHeight = windowHeight - aAbout.height - footer.height - 45;
	cnv.resize(windowWidth-20,cnvHeight);

	//go!
	installerLaSalle('accueil');



	//ce gris
	couleurMur = color(200,200,200);
	
	//cette vitesse
	frameRate(UNE_SCEONDE);

}

//P5 DRAW
function draw() {
	background(couleurMur);
	if(!loading){
		//J'ai partitionné le code pour plus de clartée
		PART_GRAVITE();
		PART_DISPLAYOBJ();
		PART_ANIMATION();
		PART_BULLE();
		PART_CAMERA();
		PART_HISTOIRE();
		drawSprites();// fonction p5.play
		PART_PORTE();
	} else {
		divBulle.html("loading....");
	}
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/////////////////////////      PARTITION DU DRAW      //////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//PART GRAVITE fait tomber le bonhomme s'il est en l'air (prévois aussi un jump sur la touche 'J')
function PART_GRAVITE () {
	man.velocity.y += GRAVITE;
	auSol = man.collide(sol);
	if (auSol) {
		man.velocity.y=0;
		if (keyDown('j')) {
			man.velocity.y -= JUMP;
		}
	}
}

//PART DISPLAYOBJ affiche tous les objets de la salle
function PART_DISPLAYOBJ () {
	spe.visible = false; // le perso spectial, masqué par déffaut
	for (var i = 0; i < salle.length; i++) {
		obj[i].display();
	}
}

//PART ANIMATION fait avancer le perso, l'anime, etc
function PART_ANIMATION () {
	// Est-ce qu'il marche ?
	if (keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW)) {
		//Il marche : 

		// Tête levée ou baissée ?
		if (!tetelevee){
			man.changeAnimation('MARCHE');
		} else {
			man.changeAnimation('MARCHETETELEVEE');
		}

		// rapide ou lent ? 
		
		if(keyIsDown(SHIFT)){
			speed=30;
			console.log('run');
		} else {
			speed =3;
		}

		// vers la gauche ou la droite ?
		if(keyIsDown(RIGHT_ARROW)){
			man.mirrorX(1);
			man.velocity.x=speed;

		} else {
			man.mirrorX(-1);
			man.velocity.x=-speed;
		}
	} else {
		// Il ne marche pas :
		man.velocity.x=0;

		// En train de danser ?
		if(ilDanse) {

			man.changeAnimation('DANSE'+int(frameCount/200%3+1));

			if(man.animation.getFrame()==8){
				man.animation.goToFrame(0);
			} else if (man.animation.getFrame()==0) {
				man.animation.goToFrame(8);
			}
		
		} else {
			// Tête levée ou baissée ?
			if (!tetelevee){
				man.changeAnimation('ARRET');
			} else {
				man.changeAnimation('LEVELATETE');
			}
		}
	}

	// edges
	if (man.position.x>LARGEUR_SCENE-30) {
		man.position.x=LARGEUR_SCENE-30;
	} else if (man.position.x<30) {
		man.position.x=30;
	}
}

//PART BULLE gère le div pour le texte
function PART_BULLE () {
	var txt = ilParle ? chosesDite : "..." ;
	if(divBulle.html()!=txt) { // on change le contenu du div que si c'est necessaire
		divBulle.html(txt);
	}
}

//PART CAMERA gere les deplacements 2D de la caméra
function PART_CAMERA () {
	
	// La camera suit le perso mais s'arrête quand il s'approche des bords
	if (man.position.x<width/2) {
		camera.position.x = width/2;
	} else if (man.position.x>LARGEUR_SCENE-width/2) {
		camera.position.x = LARGEUR_SCENE-width/2;
	} else {
		camera.position.x=man.position.x;
	}

	//on peut regarder plus en haut ou plus en bas
	if (keyDown(UP_ARROW)){
		if (camera.position.y>0) { // limite définie arbitrairement par HAUTEUR_SCENE
			camera.position.y-=10;
		}
	} else  if(keyDown(DOWN_ARROW)){
		if (camera.position.y<HAUTEUR_SCENE-height/2) {
			camera.position.y+=10;
		}
	}

	//definie la position de la tête du guide
	tetelevee = camera.position.y>=HAUTEUR_SCENE-height/2 ? false : true;
}

//PART HISTOIRE fait parler le perso
function PART_HISTOIRE () {
	ilDanse = false;
	for (var i = 0; i < salle.length; i++) {
		if(man.position.x >= obj[i].x && man.position.x <= obj[i].x+obj[i].w ){	//check si le guide est devant un obj
			chosesDite = obj[i].texte;
			ilParle = true;
			if(obj[i].nom == 'DANSE') {
				ilDanse = true;
			}
			return;
		}
	}
	ilParle = false;
	return;
}

//PART PORTE gere les portes et le chanement de salle
function PART_PORTE () {
	if(keyDown(' ')){ //SI ON APPUIE SUR LA BARRE D'ESPACE

		for (var i = 0; i < obj.length; i++) { // ON REGARDE TOUS LES OBJET
			if(obj[i].type=='porte'){ // PARTICULIÈREMENT CEUX QUI SONT DES PORTES
				if (man.position.x-20/2 >= obj[i].x && man.position.x+20 <= obj[i].x+obj[i].w) { //SI LE PERSO EST DANS L'UNE D'ELLES
					entreDansLaPorte = i; // ON IDENTIFIE LA PORTE
					estEnTrainDePasserLaPorte = true; // ON NOTE CE QU'IL SE PASSE
				}
			}
		}
	} else {
		//estEnTrainDePasserLaPorte = false;
		//entreDansLaPorte = null;
	}



	if (estEnTrainDePasserLaPorte) { // S'IL PASSE UNE PORTE

			obj[entreDansLaPorte].cachePorte(); //ON MET LE CACHE
		
			if(man.position.x <= obj[entreDansLaPorte].x -50 || man.position.x >= obj[entreDansLaPorte].x+obj[entreDansLaPorte].w+50) {
				estEnTrainDePasserLaPorte = false;
				installerLaSalle(obj[entreDansLaPorte].nom);
			}// else 	if(man.position.x-15/2 >= obj[i].x && man.position.x+15 <= obj[i].x+obj[i].w) {
			// 	estEnTrainDePasserLaPorte = false;
			// 	installerLaSalle(obj[entreDansLaPorte].nom);
			// }
	}

	
	if (keyDown(ENTER)) { // ENTRER
		var p = prompt('Entrez le nom de la salle à laquelle vous souhaitez accéder. (Prenez soin de respecter accents et majuscules).');
		if(p !== null && p !== ""){
			if(p=="mur") {
				couleurMur = color(random(200,255),random(155,200),random(155,200));
			} else {
				installerLaSalle(p);
			}
		}
	} 
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////     FONCTION INSTALLER LA SALLE     ///////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//INSTALLER LA SALLE (la salle à installer en entree) innitiallise les objets dans la salle (porte et cde)
// cette fonction calcule aussi la position des cde, la taille de la salle et deux trois truc.
function installerLaSalle (s) {
	s=s.toLowerCase();
	//Verification de l'existence de la salle
	if(!musee.salles[s]){
		alert('cette salle n\'existe pas...');
		return;
	}

	//On s'occupe de tenir l'historique des salles visitées
	if(!sallesVisitees.includes(s)){
		sallesVisitees.push(s);
	}
	
	// attention ça charge....
	loading = true;

	// on affiche le nom de la salle au dessus du Canevas et dans <title>
	var title = musee.extra.titre + " | " + s;
	document.getElementById('title').innerHTML = title;
	h.html(title);

	//on fait l'array d'objets, on calcule la position des elements et la largeur de la salle
	salle = musee.salles[s];
	largeurSalle = ecart; // variable uttilisée pour calculer la pos des objets et a la fin la largeur totale
	obj=[];
	for (var i = 0; i < salle.length; i++) {
		obj[i] = new ObjetMusee(salle[i]);
		obj[i].x = largeurSalle;
		largeurSalle += ecart + obj[i].w;
	}


	//on fini de determiner la largeur
	LARGEUR_SCENE = largeurSalle<width ? width : largeurSalle;
	
	//on cree le sol
	sol = createSprite(LARGEUR_SCENE/2,HAUTEUR_SCENE-5,LARGEUR_SCENE,10);
	sol.shapeColor = color(0);
	

	//on place camera et man
	camera.position.y = HAUTEUR_SCENE - height/2;
	camera.position.x = width/2;
	man.position.x = 100;
	man.position.y = HAUTEUR_SCENE - height-120;
	
	//c'est parti mon kiki
	loading = false;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////    OBJET MUSEE CONSTRUCTEUR    /////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// OBJETMUSEE se base sur les objets défini dans le JSON, stock image et position et contient des fonctions pour afficher les objets.
function ObjetMusee (objet) {

	// variables héritées du JSON
	this.nom = objet.nom;
	this.type = objet.type;
	this.texte = objet.texte;
	this.w = objet.w;

	// position
	this.x=0;
	
	// pref
	this.hPorte = 150;

	// p5.Image
	this.image = null;
	if(this.type == "CDE"){
		this.image = loadImage("cde/" + this.nom);
	}

	/// THIS.DISPLAY affiche l'objet où il faut
	this.display = function () {
		if(this.type == "CDE") { // POUR LES CDE
			var hauteur = HAUTEUR_SCENE - height/2 - this.image.height/2; // l'image est centrée mais
			if(this.image.height > height - HAUTEUR_MIN_CDE * 2) { // si elle est trop grande on la place a HAUTEUR_MIN_CDE du sol
				hauteur = HAUTEUR_SCENE - this.image.height - HAUTEUR_MIN_CDE;
			}
			//on affiche l'image
			if(this.image.width>1) {
				image(this.image,this.x,hauteur);
			} else {
				this.loadingDisplay();
			}

		} else if (this.type == "porte") { // POUR LES PORTES
			fill(0);
			stroke(0);
			strokeWeight(3);
			rect(this.x,HAUTEUR_SCENE-this.hPorte,this.w,this.hPorte); //enfait c'est juste un rectangle noir
			this.nomPorte(); // et le nom au dessus
		} else  { // POUR LES TRUC SPECIAUX
			spe.changeAnimation(this.nom); // l'animation est définie par le nom
			spe.visible = true;
			if (this.nom=='DANSE') {
				spe.position.y = HAUTEUR_SCENE/2 -60;
			} else {
				spe.position.y = HAUTEUR_SCENE-70;
			}
			spe.position.x = this.x + spe.width/2;
		}
	};

	// THIS.NOMPORTE affiche le nom de la porte
	this.nomPorte = function () {
		textAlign(CENTER);
		noStroke();
		fill(0);
		textSize(12);
		textStyle(sallesVisitees.includes(this.nom) ? ITALIC : NORMAL); // en italic si la salle a étée visitée
		text(this.nom, this.x+this.w/2, HAUTEUR_SCENE-this.hPorte-10);
	};

	// THIS.CACHEPORTE affiche un cache pour les moments où le guide passe une porte
	this.cachePorte = function () {
		//on fait trois rectange (au dessus, a droite et a gauche)
		fill(couleurMur);
		noStroke();
		rect(this.x-(ecart-6),  HAUTEUR_SCENE-this.hPorte,  (ecart-6),  this.hPorte-10);
		rect(this.x+this.w,  HAUTEUR_SCENE-this.hPorte,  (ecart-6),  this.hPorte-10);
		rect(this.x-this.w,  HAUTEUR_SCENE-2*this.hPorte,  this.w*3, this.hPorte);

		// on redessine le cadre de la porte
		stroke(0);
		strokeWeight(3);
		noFill();
		rect(this.x,HAUTEUR_SCENE-this.hPorte,this.w,this.hPorte);
		
		// on réaffiche le nom
		this.nomPorte();
	};

	//THIS.LOADINGDISPLAY créé un carré noir de 30px au centre de l'objet avec une animation de cercle qui tourne à l'interieur
	this.loadingDisplay = function () {
		noStroke();
		textAlign(LEFT);
		textStyle(NORMAL);
		textSize(10);
		fill(0);
		var points = ".";
		for (var i=1; i<(sin(frameCount/10)*3+3); i++) {
			points = points + ".";
		}
		text("cde loading " + points,this.x,HAUTEUR_SCENE-height/2);
		// fill(0);
		// rect(this.x,HAUTEUR_SCENE - height/2 -30,this.w,30);
		// push();
		// translate(this.x+this.w/2,HAUTEUR_SCENE - height/2 - 15);
		// noStroke();
		// fill(0); rect(-15,-15,30,30);
		// fill(255); ellipse(0,0,20,20);
		// fill(0); ellipse(0,0,15,15);
		// rotate(frameCount/10);
		// fill(0); rect(-11,-10,11,20);
		// pop();
	};
}
