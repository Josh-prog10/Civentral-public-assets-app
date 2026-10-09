import React from 'react';
import Button from '../../../shared/components/Button';
import { useRequestForm } from '../hooks/useRequestForm';
import FormField from './FormField';
import PhotoUpload from './PhotoUpload';
import SubmitFeedback from './SubmitFeedback';

const inputStyle: React.CSSProperties = {
  padding: '0.75rem',
  fontSize: '1rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  outline: 'none',
};

const RequestForm: React.FC = () => {
  const {
    formData,
    errors,
    isSubmitting,
    feedback,
    handleChange,
    handlePhotoChange,
    handleSubmit,
  } = useRequestForm();

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      <FormField label="Place" htmlFor="place" required error={errors.place}>
        <input
          id="place"
          name="place"
          type="text"
          value={formData.place}
          onChange={handleChange}
          placeholder="e.g., Barangay Hall, Caloocan"
          style={{ ...inputStyle, borderColor: errors.place ? '#d32f2f' : '#ccc' }}
        />
      </FormField>

      <FormField label="Description" htmlFor="description" required error={errors.description}>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the issue in detail..."
          style={{
            ...inputStyle,
            resize: 'vertical',
            minHeight: '100px',
            borderColor: errors.description ? '#d32f2f' : '#ccc',
          }}
        />
      </FormField>

      <FormField label="Photo (required)" htmlFor="photo" error={errors.photo}>
        <PhotoUpload
          file={formData.photo}
          onChange={handlePhotoChange}
          hasError={!!errors.photo}
          errorMessage={errors.photo}
        />
      </FormField>

      {feedback && (
        <SubmitFeedback
          type={feedback.type}
          message={feedback.message}
          referenceId={feedback.referenceId}
        />
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </Button>
    </form>
  );
};

export default RequestForm;