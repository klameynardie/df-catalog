df-catalogue-front

## Configuration des emails avec Resend

Le site envoie automatiquement un email lorsqu'une demande de devis est soumise. Pour configurer l'envoi d'emails :

### 1. Créer un compte Resend

- Allez sur https://resend.com
- Créez un compte gratuit
- Vérifiez votre domaine email (ou utilisez le domaine de test fourni par Resend)

### 2. Obtenir votre clé API

- Dans le dashboard Resend, allez dans "API Keys"
- Créez une nouvelle clé API
- Copiez la clé (elle commence par `re_`)

### 3. Configurer les variables d'environnement dans Supabase

- Connectez-vous à votre projet Supabase : https://yevgmhsgnbzucbbbhqyt.supabase.co
- Allez dans "Project Settings" > "Edge Functions" > "Manage Secrets"
- Ajoutez deux secrets :
  - `RESEND_API_KEY` : Votre clé API Resend (commence par `re_`)
  - `QUOTE_RECIPIENT_EMAIL` : L'adresse email qui recevra les demandes de devis

### 4. Format de l'email de réception

Les emails reçus contiendront :
- Les informations du client (nom, email, téléphone)
- Le message du client
- La liste des produits sélectionnés avec les quantités
- L'email du client comme adresse de réponse

### Note importante

Si vous utilisez le domaine de test Resend (`onboarding@resend.dev`), les emails ne seront envoyés qu'aux adresses email vérifiées dans votre compte Resend. Pour envoyer à n'importe quelle adresse, vous devez configurer et vérifier votre propre domaine.
