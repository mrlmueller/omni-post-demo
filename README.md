# omni-post

Ein Video hochladen, an fünf Plattformen verteilen: X/Twitter, Instagram, TikTok,
YouTube und Facebook. Ein Upload, ein Klick, fünf Veröffentlichungen.

## Das Problem

Wer regelmäßig kurze Videos veröffentlicht, lädt dieselbe Datei fünfmal hoch —
in fünf Oberflächen, mit fünf Anmeldungen, in fünf Formaten. Der Aufwand wächst
mit jeder Plattform, der Nutzen nicht.

## Architektur

Der Kern ist eine Fan-out-Verteilung über **Google Cloud Pub/Sub**. Die Next.js-App
nimmt Upload und Metadaten entgegen und veröffentlicht eine Nachricht; pro
Zielplattform hängt eine eigene Cloud Function am Topic und erledigt den Rest.

Das ist bewusst so geschnitten. Plattform-APIs fallen aus, drosseln und ändern
ihre Bedingungen unabhängig voneinander — ein gemeinsamer synchroner Aufruf hätte
bedeutet, dass ein hängendes TikTok den Instagram-Upload mitblockiert. So
scheitert im schlechtesten Fall ein Zweig, und die übrigen vier laufen durch.

**14 Cloud Functions** in Python decken die Zweige ab: je Plattform ein Upload,
dazu Videoverarbeitung, Nutzerverwaltung, Aufräumjobs und das Abrufen der
Creator-Daten bei TikTok.

## Die eigentliche Arbeit: fünf verschiedene Authentifizierungen

Jede Plattform macht es anders, und genau da steckt die Zeit:

- **X/Twitter** verlangt OAuth 1.0a mit Signatur pro Anfrage — kein Bearer-Token,
  sondern ein HMAC über Methode, URL und sortierte Parameter.
- **YouTube** läuft über OAuth 2.0 mit Refresh-Token-Umlauf.
- **TikTok** hat einen eigenen Fluss samt separatem Endpunkt für Creator-Daten,
  der vor jedem Upload abgefragt werden muss.
- **Instagram und Facebook** hängen an der Graph-API mit Langzeit-Token.

Die Nutzer-Token liegen in Firestore, die Zugangsdaten der Anwendungen kommen aus
Umgebungsvariablen.

## Stack

Next.js 15 mit React und TypeScript · Tailwind · Firebase und Firebase Admin für
Auth und Firestore · Google Cloud Pub/Sub für die Verteilung · 14 Cloud Functions
in Python · Stripe über die Firestore-Stripe-Erweiterung · Admin-Bereich mit
Nutzerverwaltung, Zugriffssteuerung und Feedback-Auswertung.

## Zugangsdaten

Sämtliche Anmeldedaten der Plattformen werden zur Laufzeit aus Umgebungsvariablen
gelesen. `cloud_functions/.env.example` listet die erwarteten Namen.

## Zu diesem Repository

Entwickelt 2024 bis April 2025, veröffentlicht als Momentaufnahme im Juli 2026
aus einem privaten Repository mit 416 Commits.

**Nicht mehr in Betrieb.** Die Cloud-Infrastruktur wurde 2026 abgebaut, die
OAuth-Zugänge der Plattformen sind abgelaufen. Der Code ist vollständig, die
Verteilung läuft aber nirgends mehr.

## Lizenz

Alle Rechte vorbehalten. Dieses Repository dient als Arbeitsprobe;
Nachnutzung nur nach Absprache.
