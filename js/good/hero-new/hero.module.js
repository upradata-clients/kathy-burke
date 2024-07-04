import { registerUnderScore } from '../lib/register-underscore.js';

const isLocal = [ 'localhost', '127.0.0.1' ].some(host => window.location.hostname === host);

const _ = await registerUnderScore({ isLocal });
_.hero.createHeroToImagePinAnimation(await _.hero.initHero());
