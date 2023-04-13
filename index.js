const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: '',
});
const openai = new OpenAIApi(configuration);

const supportedFormats = ['m4a', 'mp3', 'webm', 'mp4', 'mpga', 'wav', 'mpeg'];
const sourceDir = path.join(process.cwd(), 'source');

const generateTranscription = async (file, index) => {
    if (!supportedFormats.includes(file.split('.').pop())) return;

    try {
        const filePath = path.join(process.cwd(), 'source', file);

        const response = await openai.createTranscription(
            fs.createReadStream(filePath),
            'whisper-1',
            '',
            'srt',
                0,
            'uk',
                {
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
        );

        if (response.statusText !== 'OK') return;

        const resultName = file.replace(/\..*/, '.srt');

        fs.writeFile(
            path.join(process.cwd(), 'result', resultName),
            response.data,
            { flag: 'w' },
            err => {
                if (err) throw err;

                console.log(`File ${resultName} was saved!`);
            }
        );
    } catch(error) {
        console.error(error);

        if (typeof error === 'string') {
            throw new Error(error);
        }

        console.error(error?.response?.data?.error?.message ?? 'Something went wrong!');
    }
};

const getFiles = dir => {
    fs.readdir(sourceDir, (err, files) => {
        if (err) throw err;

        files.forEach(generateTranscription);
    });
};

getFiles(sourceDir);