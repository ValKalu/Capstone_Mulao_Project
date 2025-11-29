import { useState, useEffect, useCallback } from 'react';
import TranslationService from '../services/TranslationService';

export const useTranslatedContent = (content, language) => {
  const [translated, setTranslated] = useState(content);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);

  const translate = useCallback(async () => {
    // Reset states
    setError(null);
    setIsTranslating(false);

    // Skip if English or no content
    if (language === 'en' || !content) {
      setTranslated(content);
      return;
    }

    setIsTranslating(true);
    
    try {
      const result = await TranslationService.translate(content, language);
      setTranslated(result);
    } catch (error) {
      setError(error.message);
      setTranslated(content); // Fallback to original
    } finally {
      setIsTranslating(false);
    }
  }, [content, language]);

  useEffect(() => {
    translate();
  }, [translate]);

  return {
    translatedContent: translated,
    isTranslating,
    error,
    translate: translate // Allow manual re-translation
  };
};
