const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const images = [
    { url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop', name: 'hero-bg.jpg' },
    { url: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=2000&auto=format&fit=crop', name: 'how-it-works.jpg' },
    { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', name: 'command-center.jpg' },
    { url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=600', name: 'feature-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&q=80&w=600', name: 'feature-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600', name: 'feature-3.jpg' },
    { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600', name: 'feature-4.jpg' }, // replaced 404
    { url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=600', name: 'feature-5.jpg' },
    { url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600', name: 'feature-6.jpg' },
    { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', name: 'solution-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80', name: 'solution-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80', name: 'solution-3.jpg' }, // replaced 404
    { url: 'https://i.pravatar.cc/150?img=11', name: 'avatar-1.jpg' },
    { url: 'https://i.pravatar.cc/150?img=5', name: 'avatar-2.jpg' },
    { url: 'https://i.pravatar.cc/150?img=8', name: 'avatar-3.jpg' },
    // Use UI Avatars to avoid Liara blocking scripts
    { url: 'https://ui-avatars.com/api/?name=S+F&size=200&background=A9E8C8&color=1D1C1A', name: 'team-supervisor.png' },
    { url: 'https://ui-avatars.com/api/?name=M+R&size=200&background=E5F5EC&color=3FAE49', name: 'team-1.png' },
    { url: 'https://ui-avatars.com/api/?name=S+A&size=200&background=E5F5EC&color=3FAE49', name: 'team-2.png' },
    { url: 'https://ui-avatars.com/api/?name=A+M&size=200&background=E5F5EC&color=3FAE49', name: 'team-3.png' },
    { url: 'https://ui-avatars.com/api/?name=Y+P&size=200&background=E5F5EC&color=3FAE49', name: 'team-4.png' }
];

const downloadDir = path.join(__dirname, 'public', 'assets', 'landing');

if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        // skip if file exists
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 1000) {
            return resolve(filepath);
        }

        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            }

            const file = fs.createWriteStream(filepath);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(filepath);
            });
        });

        req.on('error', (err) => {
            fs.unlink(filepath, () => reject(err));
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request Timeout'));
        });
    });
};

async function main() {
    console.log(`Downloading images to ${downloadDir}...`);
    for (const img of images) {
        const dest = path.join(downloadDir, img.name);
        try {
            await downloadImage(img.url, dest);
            console.log(`Ready: ${img.name}`);
        } catch (err) {
            console.error(`Error downloading ${img.name}: ${err.message}`);
        }
    }
    console.log('All downloads finished.');
}

main();
