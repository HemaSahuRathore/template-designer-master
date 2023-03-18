/**
 * @license Copyright (c) 2014-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import DecoupledDocumentEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor.js';
import InlineEditorBase from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle.js';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import StandardEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/standardeditingmode.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import RestrictedEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
import TextPartLanguage from '@ckeditor/ckeditor5-language/src/textpartlanguage.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';

import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption.js';

class Editor extends DecoupledDocumentEditor { }
class InlineEditor extends InlineEditorBase { }

// Plugins to include in the build.
Editor.builtinPlugins = [
	Alignment,
	Autoformat,
	BlockQuote,
	Bold,
	CKFinderUploadAdapter,
	Essentials,
	FindAndReplace,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,

	HorizontalLine,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	IndentBlock,
	Italic,
	Paragraph,
	PasteFromOffice,
	StandardEditingMode,
	Table,
	TableCaption,
	TableToolbar,
	TableCellProperties,
	TableProperties,
	TextTransformation,
	Base64UploadAdapter,
	TextPartLanguage,
	TextTransformation,
	Underline,
	WordCount,
	RemoveFormat
];

// Editor configuration.
Editor.defaultConfig = {
	toolbar: {
		items: [
			'fontSize',
			'fontFamily',
			'bold',
			'italic',
			'underline',
			'fontBackgroundColor',
			'fontColor',
			'removeFormat',
			'indent',
			'outdent',
			'alignment:left', 'alignment:right', 'alignment:center', 'alignment:justify',

			'imageUpload',

			'insertTable',

			'horizontalLine',
			'|',
			'undo',
			'redo',
			'restrictedEditingException',
			'findAndReplace',

		]
	},
	language: 'en',
	image: {
		toolbar: [
			'imageTextAlternative',
			"|",
			"toggleImageCaption",
			"|",
			"imageStyle:alignLeft",
			"imageStyle:side",
			"imageStyle:alignRight",
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			"resizeImage"
		],
		styles: ["side", "alignLeft", "alignRight", "block", "inline"],
		resizeOptions: [
			{
				name: "resizeImage:original",
				value: null,
				icon: "original"
			},
			{
				name: "resizeImage:10",
				value: "10",
				icon: "medium"
			},
			{
				name: "resizeImage:25",
				value: "25",
				icon: "medium"
			},
			{
				name: "resizeImage:50",
				value: "50",
				icon: "medium"
			},
			{
				name: "resizeImage:75",
				value: "75",
				icon: "large"
			}
		]
	},
	fontFamily: {
		options: [
			'default', 'Arial', 'Courier New', 'Georgia', "Lucida Sans Unicode", "Tahoma", "Times New Roman", "Trebuchet Ms", "Verdana",
			'Univers Bold', 'Univers'
		], supportAllValues: true
	},
	fontSize: {
		options: [9,
			10,
			11, 12,
			13,
			14, 15, 16,
			17, 18, 19, 20,
			21, 22, 23, 25, 28, 30, 36
		]
		, supportAllValues: true
	},

	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableCellProperties',
			'tableProperties',
			"toggleTableCaption"
		]
	}
};

// Plugins to include in the build.
InlineEditor.builtinPlugins = [

	Alignment,
	Autoformat,
	BlockQuote,
	Bold,
	CKFinderUploadAdapter,
	Essentials,
	FindAndReplace,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	HorizontalLine,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	IndentBlock,
	Italic,
	Paragraph,
	PasteFromOffice,
	StandardEditingMode,
	Table,
	TableCaption,
	TableToolbar,
	TableCellProperties,
	TableProperties,
	TextTransformation,
	Base64UploadAdapter,
	TextPartLanguage,
	TextTransformation,
	Underline,
	WordCount,
	RemoveFormat,
	RestrictedEditingMode
];

// Editor configuration.
InlineEditor.defaultConfig = {
	// toolbar: {
	// 	// items: [
	// 	// 	'undo',
	// 	// 	'redo',
	// 	// 	'restrictedEditing'
	// 	// ]
	// },
	language: 'en',
	image: {
		toolbar: [
			'imageTextAlternative',
			"|",
			"toggleImageCaption",
			"|",
			"imageStyle:alignLeft",
			"imageStyle:side",
			"imageStyle:alignRight",
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			"resizeImage"
		],
		styles: ["side", "alignLeft", "alignRight", "block", "inline"],
		resizeOptions: [
			{
				name: "resizeImage:original",
				value: null,
				icon: "original"
			},
			{
				name: "resizeImage:10",
				value: "10",
				icon: "medium"
			},
			{
				name: "resizeImage:25",
				value: "25",
				icon: "medium"
			},
			{
				name: "resizeImage:50",
				value: "50",
				icon: "medium"
			},
			{
				name: "resizeImage:75",
				value: "75",
				icon: "large"
			}
		]
	},
	fontFamily: {
		options: [
			'default', 'Arial', 'Courier New', 'Georgia', "Lucida Sans Unicode", "Tahoma", "Times New Roman", "Trebuchet Ms", "Verdana",
			'Univers Bold', 'Univers'
		], supportAllValues: true
	},
	fontSize: {
		options: [9,
			10,
			11, 12,
			13,
			14, 15, 16,
			17, 18, 19, 20,
			21, 22, 23, 25, 28, 30, 36
		]
		, supportAllValues: true
	},

	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableCellProperties',
			'tableProperties',
			"toggleTableCaption"
		]
	}
};

export default {
	Editor, InlineEditor
};
