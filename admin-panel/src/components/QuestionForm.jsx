import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import RichTextEditor from './RichTextEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createQuestion, updateQuestion, uploadImage, uploadVideo, getQuestionById } from '../api';

const QuestionForm = ({ initialData = null, onSuccess }) => {
  const { id } = useParams(); // Get ID from URL for editing
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      year: new Date().getFullYear(),
      examType: 'prelims',
      examName: '',
      subject: '',
      topic: '',
      questionText: '',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A',
      explanation: '',
      difficulty: 'medium',
      marks: 2,
      isVerified: false,
      isActive: true,
    }
  });

  const [questionText, setQuestionText] = useState(initialData?.questionText || '');
  const [explanation, setExplanation] = useState(initialData?.explanation || '');
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load question for editing
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadQuestion();
    }
  }, [id]);

  const loadQuestion = async () => {
    setLoadingQuestion(true);
    try {
      const response = await getQuestionById(id);
      const q = response.data.data?.question;
      
      if (!q) {
        throw new Error('Question not found');
      }
      
      // Convert options Map to object
      const optionsObj = {};
      if (q.options) {
        Object.entries(q.options).forEach(([key, value]) => {
          optionsObj[key] = value;
        });
      }
      
      // Reset form with loaded data
      reset({
        year: q.year,
        examType: q.examType,
        examName: q.examName,
        subject: q.subject,
        topic: q.topic || '',
        options: optionsObj,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        marks: q.marks,
        isVerified: q.isVerified,
        isActive: q.isActive,
      });
      
      setQuestionText(q.questionText);
      setExplanation(q.explanation || '');
    } catch (err) {
      alert('Failed to load question: ' + err.message);
      navigate('/questions');
    } finally {
      setLoadingQuestion(false);
    }
  };
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleImageUpload = async (e, field) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadImage(file));
      const responses = await Promise.all(uploadPromises);
      const imageUrls = responses.map(res => res.data.data.secure_url);
      
      // Add to existing images array
      const currentImages = watch(field) || [];
      setValue(field, [...currentImages, ...imageUrls]);
      
      alert(`${imageUrls.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadVideo(file);
      const videoUrl = response.data.data.secure_url;
      
      // Add to existing videos array
      const currentVideos = watch('explanationVideos') || [];
      setValue('explanationVideos', [...currentVideos, videoUrl]);
      
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Video upload error:', error);
      alert('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    
    try {
      // Add rich text content
      data.questionText = questionText;
      data.explanation = explanation;

      // API call
      if (isEditMode && id) {
        await updateQuestion(id, data);
        alert('Question updated successfully!');
        navigate('/questions');
      } else {
        await createQuestion(data);
        alert('Question created successfully!');
        // Reset form after creating
        reset();
        setQuestionText('');
        setExplanation('');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.response?.data?.message || 'Failed to save question');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loadingQuestion) {
    return (
      <div className="max-w-7xl mx-auto text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2">Loading question...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isEditMode ? 'Edit Question' : 'Create New Question'}
        </h2>
        {isEditMode && (
          <button
            type="button"
            onClick={() => navigate('/questions')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to Questions
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Metadata Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Year *</label>
            <input
              type="number"
              {...register('year', { required: 'Year is required', min: 1990, max: 2100 })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Exam Type *</label>
            <select
              {...register('examType', { required: 'Exam type is required' })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="prelims">Prelims</option>
              <option value="mains">Mains</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Exam Name *</label>
            <input
              type="text"
              {...register('examName', { required: 'Exam name is required' })}
              placeholder="e.g., UPSC Prelims"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.examName && <p className="text-red-500 text-sm mt-1">{errors.examName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input
              type="text"
              {...register('subject', { required: 'Subject is required' })}
              placeholder="e.g., History, Polity"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Topic *</label>
            <input
              type="text"
              {...register('topic', { required: 'Topic is required' })}
              placeholder="e.g., Medieval India"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.topic && <p className="text-red-500 text-sm mt-1">{errors.topic.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select
              {...register('difficulty')}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Marks</label>
            <input
              type="number"
              {...register('marks', { min: 1 })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium mb-1">Question Text *</label>
          <p className="text-xs text-gray-600 mb-2">
            Type normally or paste from Excel. Use table button for match-the-following.
          </p>
          <RichTextEditor
            content={questionText}
            onChange={setQuestionText}
            placeholder="Enter the question here..."
          />
          {!questionText && <p className="text-red-500 text-sm mt-1">Question text is required</p>}
        </div>

        {/* Question Images */}
        <div>
          <label className="block text-sm font-medium mb-1">Question Images (Optional)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageUpload(e, 'questionImages')}
            className="w-full px-3 py-2 border rounded-md"
            disabled={uploading}
          />
          {watch('questionImages')?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {watch('questionImages').map((url, idx) => (
                <img key={idx} src={url} alt={`Q ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-2">Options *</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['A', 'B', 'C', 'D'].map(option => (
              <div key={option}>
                <label className="block text-xs text-gray-600 mb-1">Option {option}</label>
                <input
                  type="text"
                  {...register(`options.${option}`, { required: 'Option is required' })}
                  placeholder={`Enter option ${option}`}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {errors.options?.[option] && (
                  <p className="text-red-500 text-xs mt-1">{errors.options[option].message}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Correct Answer */}
        <div>
          <label className="block text-sm font-medium mb-1">Correct Answer *</label>
          <input
            type="text"
            {...register('correctAnswer', { required: 'Correct answer is required' })}
            placeholder="e.g., A or B or 1, 2 and 3"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-600 mt-1">
            For single correct: A, B, C, or D. For multiple: "1, 2 and 3" or "A and C"
          </p>
          {errors.correctAnswer && <p className="text-red-500 text-sm mt-1">{errors.correctAnswer.message}</p>}
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium mb-1">Explanation</label>
          <RichTextEditor
            content={explanation}
            onChange={setExplanation}
            placeholder="Explain the correct answer..."
          />
        </div>

        {/* Explanation Images */}
        <div>
          <label className="block text-sm font-medium mb-1">Explanation Images (Optional)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageUpload(e, 'explanationImages')}
            className="w-full px-3 py-2 border rounded-md"
            disabled={uploading}
          />
          {watch('explanationImages')?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {watch('explanationImages').map((url, idx) => (
                <img key={idx} src={url} alt={`E ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
              ))}
            </div>
          )}
        </div>

        {/* Explanation Videos */}
        <div>
          <label className="block text-sm font-medium mb-1">Explanation Videos (Optional)</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="w-full px-3 py-2 border rounded-md"
            disabled={uploading}
          />
          {watch('explanationVideos')?.length > 0 && (
            <div className="mt-2">
              {watch('explanationVideos').map((url, idx) => (
                <div key={idx} className="text-sm text-blue-600">Video {idx + 1}: {url}</div>
              ))}
            </div>
          )}
        </div>

        {/* Status Toggles */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isVerified')} className="w-4 h-4" />
            <span className="text-sm">Verified</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isActive')} className="w-4 h-4" />
            <span className="text-sm">Active</span>
          </label>
        </div>

        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-blue-600 hover:underline text-sm"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>

        {/* Preview Section */}
        {showPreview && (
          <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-bold mb-2">📱 Preview (How it will appear in app/web)</h3>
            <div className="bg-white p-4 rounded shadow">
              <div className="preview-content" dangerouslySetInnerHTML={{ __html: questionText }} />
              <div className="mt-4 space-y-2">
                {Object.entries(watch('options') || {}).map(([key, value]) => (
                  <div key={key} className="p-3 border-2 rounded hover:bg-blue-50 cursor-pointer transition">
                    <strong className="text-lg">{key}:</strong> <span className="ml-2">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitLoading || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitLoading ? 'Saving...' : (initialData ? 'Update Question' : 'Create Question')}
          </button>
          
          {uploading && <span className="text-sm text-gray-600">Uploading media...</span>}
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
