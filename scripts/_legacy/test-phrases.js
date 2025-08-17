#!/usr/bin/env node

// Test the phrase generation system
import { generateCaptionPhrase, calculateMaxCombinations } from './src/utils/phraseComponents.js';

console.log('🎯 MILLION LISTING PHRASE SYSTEM TEST');
console.log('=====================================\n');

// Test combinations
console.log('📊 MAXIMUM COMBINATIONS POSSIBLE:');
console.log(`Total unique phrases: ${calculateMaxCombinations().toLocaleString()}\n`);

console.log('🎨 SAMPLE PHRASES BY DEMOGRAPHIC:\n');

// Affluent Millennial Women (Professional)
console.log('👩‍💼 PROFESSIONAL WOMEN:');
for (let i = 0; i < 5; i++) {
  const bigWave = generateCaptionPhrase('big', 'professional_millennial_woman', 'work');
  const smallWave = generateCaptionPhrase('small', 'professional_millennial_woman', 'work');
  console.log(`  Big Wave:   ${bigWave}`);
  console.log(`  Small Wave: ${smallWave}\n`);
}

// Affluent Millennial Men (Professional)
console.log('👨‍💼 PROFESSIONAL MEN:');
for (let i = 0; i < 5; i++) {
  const bigWave = generateCaptionPhrase('big', 'professional_millennial_man', 'work');
  const smallWave = generateCaptionPhrase('small', 'professional_millennial_man', 'lifestyle');
  console.log(`  Big Wave:   ${bigWave}`);
  console.log(`  Small Wave: ${smallWave}\n`);
}

// New Parents
console.log('👶 NEW PARENTS:');
for (let i = 0; i < 5; i++) {
  const bigWave = generateCaptionPhrase('big', 'millennial_parent', 'parent');
  const smallWave = generateCaptionPhrase('small', 'millennial_parent', 'parent');
  console.log(`  Big Wave:   ${bigWave}`);
  console.log(`  Small Wave: ${smallWave}\n`);
}

console.log('🚀 SYSTEM READY FOR MILLION LISTING GENERATION!');