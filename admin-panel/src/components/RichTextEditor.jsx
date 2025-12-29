import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="border border-gray-300 border-b-0 rounded-t-md bg-gray-50 p-2 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 rounded text-sm font-medium ${
          editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 border'
        }`}
      >
        <strong>B</strong>
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 rounded text-sm ${
          editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 border'
        }`}
      >
        <em>I</em>
      </button>

      <div className="w-px h-6 bg-gray-300"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1.5 rounded text-sm ${
          editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 border'
        }`}
      >
        H2
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1.5 rounded text-sm ${
          editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 border'
        }`}
      >
        H3
      </button>

      <div className="w-px h-6 bg-gray-300"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1.5 rounded text-sm ${
          editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 border'
        }`}
      >
        • List
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1.5 rounded text-sm ${
          editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 border'
        }`}
      >
        1. List
      </button>

      <div className="w-px h-6 bg-gray-300"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().insertTable({ rows: 5, cols: 2, withHeaderRow: true }).run()}
        className="px-3 py-1.5 rounded text-sm bg-green-500 text-white hover:bg-green-600 font-medium"
        title="Insert Table (5 rows x 2 columns)"
      >
        ➕ Table
      </button>

      {editor.isActive('table') && (
        <>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-1.5 rounded text-xs bg-white hover:bg-gray-100 border"
            title="Add Column After"
          >
            + Col
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-1.5 rounded text-xs bg-white hover:bg-gray-100 border"
            title="Add Row After"
          >
            + Row
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-1.5 rounded text-xs bg-white hover:bg-gray-100 border"
            title="Delete Column"
          >
            − Col
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-1.5 rounded text-xs bg-white hover:bg-gray-100 border"
            title="Delete Row"
          >
            − Row
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2 py-1.5 rounded text-xs bg-red-500 text-white hover:bg-red-600"
            title="Delete Entire Table"
          >
            🗑️ Delete Table
          </button>
        </>
      )}
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = "Enter question text..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-400',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 font-bold border border-gray-400 p-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-400 p-2',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  return (
    <div className="rich-text-editor w-full">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="prose max-w-none" />
      <div className="text-xs text-gray-500 mt-1 px-2">
        💡 Tip: Click "➕ Table" to create tables visually. Click inside cells to edit. Use +/− buttons to modify.
      </div>
    </div>
  );
};

export default RichTextEditor;
