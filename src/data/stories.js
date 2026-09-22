export const stories = {
  intro: { name: 'The shattered relics', continueLabel: 'Begin chapter one', next: '/worlds/meadow/levels', pages: [
    { title: 'Five relics. One kingdom.', text: 'For generations, five ancient relics protected the kingdom of Aaranya. Their light kept its rivers clear, its forests alive, and its people safe.' },
    { title: 'A journey begins.', text: 'A mysterious force shattered the relics and corrupted the five regions. Veer sets out to recover their fragments, restore their power, and bring his kingdom back to life.' },
  ] },
  'world-meadow': { name: 'Meadow Lands', next: '/worlds/meadow/levels', pages: [{ title: 'Beyond the village.', text: 'The meadows still shine in the morning light, but strange creatures wander familiar paths. Veer follows the river toward the first relic.' }] },
  'world-woods': { name: 'Whispering Woods', next: '/worlds/woods/levels', pages: [{ title: 'The trees remember.', text: 'A whisper travels beneath the canopy. The forest remembers the relic that once protected it. Veer follows its fading voice into the dark.' }] },
  'world-ruins': { name: 'Sunken Ruins', next: '/worlds/ruins/levels', pages: [{ title: 'Beneath the still water.', text: 'Ancient halls lie beneath the flood. Somewhere among their broken stones, a relic fragment still glows. Veer steps into the drowned kingdom.' }] },
  'world-peaks': { name: 'Crimson Peaks', next: '/worlds/peaks/levels', pages: [{ title: 'A light above the clouds.', text: 'Red mountains rise through the mist. The corruption has reached even these lonely heights, but a distant light guides Veer upward.' }] },
  'world-citadel': { name: 'Shadow Citadel', next: '/worlds/citadel/levels', pages: [{ title: 'Where the shadows gather.', text: 'The final region waits behind black stone walls. Veer carries the hope of four lands toward the force that shattered their protection.' }] },
  'boss-meadow': { name: 'The Stone Guardian', next: '/worlds', pages: [{ title: 'The guardian stirs.', text: 'At the old sanctuary, stone begins to move. Corruption has taken the guardian of the meadow relic. Veer draws his sword, determined to free it.' }] },
  'boss-woods': { name: 'The Thorn Keeper', next: '/worlds', pages: [{ title: 'A heart bound in thorns.', text: 'Roots close around the forest shrine. Its keeper can no longer hear the trees. Veer must break the corruption before the woods fall silent.' }] },
  'boss-ruins': { name: 'The Flood Sentinel', next: '/worlds', pages: [{ title: 'The waters rise.', text: 'A sentinel emerges from the drowned shrine, guarding a fragment it no longer understands. Veer stands his ground as the water rises.' }] },
  'boss-peaks': { name: 'The Crimson Warden', next: '/worlds', pages: [{ title: 'At the summit.', text: 'The mountain warden blocks the path to the relic. Darkness burns where its guiding flame once shone. Veer prepares to restore that light.' }] },
  'boss-citadel': { name: 'The final shadow', next: '/worlds', pages: [{ title: 'One last stand.', text: 'The force behind the shattered relics rises within the citadel. Veer holds the recovered fragments close. The fate of Aaranya rests on this final battle.' }] },
  ending: { name: 'Aaranya restored', continueLabel: 'Return to the kingdom', next: '/worlds', pages: [
    { title: 'The five lights return.', text: 'The relics are whole again. Their light flows through the five regions, washing corruption from river, forest, stone, and sky.' },
    { title: 'Home, at last.', text: 'Aaranya wakes to a new morning. Veer returns to the village where his journey began, knowing that even small steps can restore a kingdom.' },
  ] },
};
