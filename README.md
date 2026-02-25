Programmering Eksamen 2026 – Vinter OL Styrtløb

Github link:


Udført af:
Güney Alan

E-mail:
guoz0001@stud.ek.dk


Kort beskrivelse af projektet

Dette projekt er en full-stack webapplikation til administration af styrtløb ved Vinter-OL.  
Projektet er udviklet med Spring Boot, JPA, MySQL og en simpel frontend med HTML, CSS og JavaScript.
___________________
1. Database

o Databasen er oprettet med JPA-relationer mellem:
- Nation
- Skier
- Competition
- Run
- Result

o Der oprettes automatisk testdata ved opstart:
- 10 nationer
- flere løbere
- 1 konkurrence
- 2 runs
- resultater

o Databasen kører lokalt på:
jdbc:mysql://localhost:3306/vinterol_db
________________________________________

2. REST API

o Alle nødvendige endpoints er implementeret.

Endpoints:

1. POST /skiers
2. PUT /skiers/{id}
3. DELETE /skiers/{id}
4. GET /nations/{nationId}/skiers
5. POST /results
6. GET /runs/{runId}/results
7. GET /competitions
8. GET /competitions/{id}/leaderboard

o DTO’er anvendes for clean API og separation mellem database og klient.
________________________________________

3. Frontend

o Frontenden er udviklet med HTML, CSS og JavaScript.

Struktur:
- index.html
- css/style.css
- js/app.js

o Frontenden kan:
- vise konkurrencer
- vise leaderboard
- vise løbere per nation
- vise resultater for et run
________________________________________
Tests
o Projektet indeholder unit tests for leaderboard og registrering af resultater.
________________________________________
Bemærkninger

• Spring Security er ikke implementeret.  
• Fokus har været på korrekt arkitektur og opfyldelse af opgavekrav.