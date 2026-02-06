import { BilingualReader } from '../src/components/BilingualReader';
import { chapter1 } from '../src/data/tod-in-venedig-ch1';
import { router } from 'expo-router';

export default function ReaderScreen() {
  return (
    <BilingualReader
      chapter={chapter1}
      onBack={() => router.back()}
    />
  );
}
