# JudetAs
Daniel Birleanu Clasa XI-a CNAIC Galati danielbirleanu@gmail.com *ca pe proces verbal*
Profesor Indrumator Joc Genia

User+Admin login 1escapenewspaper, parola escapenewspaper1 

Un proiect.. incercat. :_)

# Documentatia explicita a unei poveșt..aheem unui Proiect *de ambitie*  

Dani, main character, afla de un concurs de web development cu premii mari si un posibil tichet spre universitate. Reuseste sa se inscrie pe ultima suta de metri, iar apoi uitandu-se pe tema se gandeste el cum ar veni **aaplicatia aasta?** *accent*

## \*\*2 eternities lat*er*..AHEM zile mai tarziu

Incepe el, pulls up a quick create-react-app, face un layout din 2 vorbe 3 miscari au iesit 4 div-uri 3 flexbox-uri; Incepe el prima componenta care o crede importanta **export default function Header()**, headerul cu fonturi amintite din proiecte trecute, si cu paleta de culori *brand-spanking new* arăta destul de promitator avand lucrat numai o or..AHEM cateva zeci de minute la el. Dupa cateva batai de cap cu path-clips si alte flecăreli din acestea, Dani cea zis? *"Bai arata bine mai lucrez maine"*  
![alt text](https://i.imgur.com/Svm0ys9.png)

### backends without data - the mind *en*boggling

Nu 2 saptamani mai tarziu Dani isi aduce aminte de concurs si zice sa inceapa cu backend-ul ca sa faca frontendul apoia direct cu chemari in api.

Pentru ca voia sa faca un asa numit SPA, a inceput sa caute informatii pe subiect. *Google search: react SPA best practices* pentru ca mna n-a vrut sa nu se incurce in chestiuni mici. Citeste el 'React SPA security auth0.com" *OAuth2.0 PKCE Code flow* "Are sens dar prea complicat vreau sa o fac numai dintr-un call" *access token rotation* "mmm! asta suna bine (si usor)" hai sa implementam.

Repede scoate un server express cu care suntemAHGRM este\*\*\*\* *mama ce raceala trag ma las de povestit*  foarte familiar pentru ca i se pare cea mai usoara chestie din lume, si deschide un cont gratis de redis cloud ( Se certase intr-un proiect anterior cu redis si a zis ca de data asta il invinge). 

**Node-redis v4.1** "pfiu sa speram ca versiunea asta nu mai e asa panarama*

(frontend nefacut inca, revenim asupra redis-ului mai tarziu).

Scrie Dani un middleware rapid care sa verifice si sa roteasca AccessToken-urile la fiecare strigare catre api.
(if token belongs to session, but isnt the last token generated, the session has been previously hijacked => invalidate session)


Ne avand experienta prea multa Dani, scrie totul cum ii pica din cap la moment (revenim mai tarziu).
### mongo - ose?
 Incepe o baza de date noua in mongo cloud, pune permisii in mongo atlas alea alea. Scrie scheme in modele cum crede el ca se leaga mai bine astfel incat sa nu trebuiasca prea mult query-uri dar in acelasi timp sa poate accessa fiecare chestie in parte (upvote per postare per user, adminRole care are numai 2 fielduri care sunt defapt pointere catre documentul de localitate, si doc ul de user, etc).

Si le scrie el asa fara sa testeze nimic. Fara sa scrie nimic pe hartie sau intr-un document separat ca sa le aiba pe toata in fata.

" Hai sa o lasam cu experimentele in fisiere(vezi ~/experimente-populari), si sa rulam direct index.js -- ca baietii deopotriva "

### **PLANGE POWERSHELL UL**

> expres.router() is not a function *adica?!!????* :(
> User.findOne() is not a function *unde e mongoose.model()? cam neserios nu glumesc*
> unexpected token await in sync function specify asy..
> and 29 other errors..

"Bun am rezolvat vad ca porneste acuma pe uscat, mai scriu cateva /api/ route-uri de care cred ca o sa am nevoie si trec pe frontend *fara sa testez*"


# *Ultima saptamana*

luni-marti scrie dani 10 api route uri le gandeste si le regandeste

miercuri-joi-vineri liber dani de la liceu special pentru concursul de la onorata **Universitatea Iasi**

vine miercuri
"Ok vad ca a pornit Postman-ul azi, hai sa testam niste api-uri scoatem middlewareul ('adminTokenProcessing.js') de token rotation din circuit (revenim si la asta) sa nu trebuiasca sa fac un auth flow"

Ii merg lui Dani cateva.. altele nu.. cele mai multe nu, *debugging* "mă ce? nu asa se foloseste?;;;; unexpected token await in synchronous function;;;; etc" *violent debugging* "ok merg acuma, hai sa facem panoul de administrare si invatam maine react-native pentru poimaine;"

**panoul de administrare** Dani incapatanat nu vrea sa faca SPA cu 'react-router' *ca sa nu se complice* *cică*
"Mai am 5 zile, o iau pe ocolite de react-router ca cine stie cat mi-ar mai lua sa invat si ala; tot auth ul il bag in App cu state ca sa nu mai complic si cu contexte" 
2 ore mai tarziu Dani nu stie ce e ala reference vs actual state
si nu intelege de *NICIODATA* nu i se updateaza componenta odata cu props urile;

6 ore mai tarziu ora 11 dani a incercat 3 metode diferite sa paseze sau sa reia datele din parent component (pentru ca ce ar fi ala useCallback([])?)

Dani, ora 3 dimineata, dupa inca cateva ore in care a mai facut cateva componente pentru UI (dintre care cateva nici nu lea folosit in ultima) ca sa nu mearga la culcare fara sa fii facut nimic, se culca intr-un final.

E ora 23:58 si trebuie sa dau push la poveste asa ca asta e pe scurt urmatoarele zile redbull pentru prima oara cola red bull tehnici de a sta treaz sa mai incerce

incercat react native next js si altele

23:59

