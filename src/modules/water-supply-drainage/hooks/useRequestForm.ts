import { ChangeEvent, FormEvent, useState } from 'react';
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_SIZE_MB } from '../constants/categories';
import { submitWaterRequest } from '../services/requestService';
import type { FormErrors, RequestFormData } from '../types';

const INITIAL_STATE: RequestFormData = {
  place: '',
  description: '',
  latitude: null,
  longitude: null,
  photoUri: null,
  photoFileName: null,
  photo: null,
  staffRemarks: null,
};

export function useRequestForm() {
  const [formData, setFormData] = useState<RequestFormData>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    referenceId?: string;
  } | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePhotoChange = (file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, photo: null }));
      return;
    }

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Only JPG, PNG, or WEBP images are allowed.',
      }));
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: `Photo must be smaller than ${MAX_PHOTO_SIZE_MB}MB.`,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, photo: file }));
    setErrors((prev) => ({ ...prev, photo: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!formData.place.trim()) next.place = 'Place is required.';
    if (!formData.description.trim()) next.description = 'Description is required.';
    if (formData.latitude == null || formData.longitude == null) next.place = 'Resolve a place within Caloocan before submission.';
    if (!formData.photoUri) next.photo = 'A photo of the issue is required before submission.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await submitWaterRequest(formData);
      setFeedback({
        type: result.success ? 'success' : 'error',
        message: result.message,
        referenceId: result.referenceId,
      });
      if (result.success) {
        setFormData(INITIAL_STATE);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    feedback,
    handleChange,
    handlePhotoChange,
    handleSubmit,
  };
}