import { registerUnderScore } from '../lib/register-underscore.js';


const _ = await registerUnderScore();
_.hero.createHeroToImagePinAnimation(await _.hero.initHero());
