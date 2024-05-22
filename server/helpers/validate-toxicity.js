import axios from 'axios';

const validateToxicity = async (req, res, next) => {
    try {
        const { comment } = req.body;
        if (!comment?.length) {
            console.error('Message argument is required.');
            return res.status(400).json({ error: 'Message argument is required.' });
        }
        if (comment.split(/\s/).length > 35 || comment.length > 1000) {
            console.error('Message exceeds length limits.');
            return res.status(413).json({
                error: 'Due to temporary cloudflare limits, a message can only be up to 35 words or 1000 characters.',
            });
        }

        console.log(`Received comment for validation: ${comment}`);

        const response = await axios.post('http://localhost:5000/classify-comment', { comment });
        const { toxic, severe_toxic, obscene, threat, insult, identity_hate } = response.data;

        console.log(`Classification result: ${JSON.stringify(response.data)}`);

        const classifications = [
            { label: 'toxic', value: toxic },
            { label: 'severe_toxic', value: severe_toxic },
            { label: 'obscene', value: obscene },
            { label: 'threat', value: threat },
            { label: 'insult', value: insult },
            { label: 'identity_hate', value: identity_hate }
        ];

        let isProfane = false;
        let flaggedClasses = [];

        classifications.forEach(cls => {
            console.log(`${cls.label}: ${cls.value} (threshold: 0.5)`);
            if (cls.value >= 0.5) {
                isProfane = true;
                flaggedClasses.push({ class: cls.label, score: cls.value });
            }
        });

        if (isProfane) {
            console.warn(`Comment classified as toxic: ${comment}`);
            return res.status(403).json({
                isProfanity: true,
                flaggedClasses,
            });
        }

        next();
    } catch (error) {
        console.error(`Error during classification: ${error}`, error);
        return res.status(500).json({ error: "Something Went Wrong." });
    }
}

export { validateToxicity };
