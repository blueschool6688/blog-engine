import { t as setCookie } from "./cookie-IQQz9tHN.js";
import { useRouteLoaderData } from "react-router";
import { createContext, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
//#region src/context/LanguageContext.tsx
var dictionary = {
	home: {
		vi: "Trang Chủ",
		en: "Home"
	},
	articles: {
		vi: "Bài Viết",
		en: "Articles"
	},
	authors: {
		vi: "Tác Giả",
		en: "Authors"
	},
	feedback: {
		vi: "Phản hồi",
		en: "Feedback"
	},
	admin_cms: {
		vi: "Quản trị CMS",
		en: "Admin CMS"
	},
	login: {
		vi: "Đăng Nhập",
		en: "Login"
	},
	logout: {
		vi: "Đăng Xuất",
		en: "Logout"
	},
	dashboard: {
		vi: "Bảng điều khiển",
		en: "Dashboard"
	},
	posts: {
		vi: "Bài viết",
		en: "Posts"
	},
	media_library: {
		vi: "Thư viện Media",
		en: "Media Library"
	},
	categories: {
		vi: "Chuyên mục",
		en: "Categories"
	},
	tags: {
		vi: "Thẻ tag",
		en: "Tags"
	},
	comments: {
		vi: "Bình luận",
		en: "Comments"
	},
	feedbacks: {
		vi: "Phản hồi góp ý",
		en: "Feedbacks"
	},
	settings: {
		vi: "Cài đặt",
		en: "Settings"
	},
	users: {
		vi: "Thành viên",
		en: "Users"
	},
	audit_logs: {
		vi: "Nhật ký hệ thống",
		en: "Audit Logs"
	},
	translate_jobs: {
		vi: "Dịch thuật AI",
		en: "Translate Jobs"
	},
	sign_out: {
		vi: "Đăng xuất",
		en: "Sign Out"
	},
	latest_articles: {
		vi: "Bài viết mới nhất",
		en: "Latest Articles"
	},
	read_more: {
		vi: "Đọc tiếp",
		en: "Read more"
	},
	search_placeholder: {
		vi: "Tìm kiếm bài viết... (Kubernetes, CI/CD, Terraform...)",
		en: "Search articles... (Kubernetes, CI/CD, Terraform...)"
	},
	loading: {
		vi: "Đang tải...",
		en: "Loading..."
	},
	no_articles: {
		vi: "Không tìm thấy bài viết nào.",
		en: "No articles found."
	},
	terms_of_service: {
		vi: "Điều khoản dịch vụ",
		en: "Terms of Service"
	},
	privacy_policy: {
		vi: "Chính sách bảo mật",
		en: "Privacy Policy"
	},
	all_rights_reserved: {
		vi: "Đã đăng ký bản quyền.",
		en: "All rights reserved."
	},
	back_to_home: {
		vi: "Quay lại Trang chủ",
		en: "Back to Home"
	},
	back_to_authors: {
		vi: "Quay lại danh sách Tác giả",
		en: "Back to Authors"
	},
	read_time_mins: {
		vi: "phút",
		en: "mins"
	},
	all_posts: {
		vi: "Tất cả",
		en: "All"
	},
	filtering_by: {
		vi: "Đang lọc theo:",
		en: "Filtering by:"
	},
	clear_filter: {
		vi: "Xóa bộ lọc",
		en: "Clear Filter"
	},
	search_posts: {
		vi: "Tìm kiếm",
		en: "Search"
	},
	today: {
		vi: "Hôm nay",
		en: "Today"
	},
	days_ago: {
		vi: "ngày trước",
		en: "days ago"
	},
	weeks_ago: {
		vi: "tuần trước",
		en: "weeks ago"
	},
	months_ago: {
		vi: "tháng trước",
		en: "months ago"
	},
	years_ago: {
		vi: "năm trước",
		en: "years ago"
	},
	prev: {
		vi: "← Trước",
		en: "← Prev"
	},
	next: {
		vi: "Tiếp →",
		en: "Next →"
	},
	no_posts: {
		vi: "Không tìm thấy bài viết nào.",
		en: "No articles found."
	},
	clear_filter_try_again: {
		vi: "Xóa bộ lọc và thử lại",
		en: "Clear filters and try again"
	},
	latest_articles_title: {
		vi: "Bài viết mới nhất",
		en: "Latest Articles"
	},
	page_not_found: {
		vi: "Trang không tìm thấy",
		en: "Page Not Found"
	},
	page_not_found_desc: {
		vi: "Đường dẫn bạn truy cập không tồn tại hoặc đã bị di dời.",
		en: "The page you are looking for does not exist or has been moved."
	},
	redirecting_home: {
		vi: "Tự động quay về trang chủ sau {seconds} giây...",
		en: "Redirecting to home in {seconds} seconds..."
	},
	excellent: {
		vi: "Tuyệt vời! Rất thích.",
		en: "Excellent! Love it."
	},
	good: {
		vi: "Tốt. Rất hài lòng.",
		en: "Good. Very pleased."
	},
	average: {
		vi: "Bình thường. Cần cải thiện.",
		en: "Average. Needs work."
	},
	poor: {
		vi: "Kém. Không hài lòng.",
		en: "Poor. Not satisfied."
	},
	terrible: {
		vi: "Rất tệ. Thất vọng.",
		en: "Terrible. Very disappointed."
	},
	fill_fields: {
		vi: "Vui lòng điền đầy đủ các thông tin bắt buộc.",
		en: "Please fill in all required fields."
	},
	our_writers: {
		vi: "Đội ngũ Tác giả",
		en: "Our Writers"
	},
	no_authors: {
		vi: "Không tìm thấy tác giả nào trong thư mục.",
		en: "No authors found in the directory."
	},
	no_bio: {
		vi: "Tác giả này hiện chưa cập nhật tiểu sử.",
		en: "This author has not updated their biography yet."
	},
	copy_code: {
		vi: "Sao chép code",
		en: "Copy code"
	},
	copied: {
		vi: "Đã sao chép!",
		en: "Copied!"
	},
	copy: {
		vi: "Sao chép",
		en: "Copy"
	},
	loading_post: {
		vi: "Đang tải bài viết...",
		en: "Loading article..."
	},
	post_not_found: {
		vi: "Không tìm thấy bài viết.",
		en: "Article not found."
	},
	table_of_contents: {
		vi: "Mục lục bài viết",
		en: "Table of Contents"
	},
	meet_the_authors: {
		vi: "Gặp gỡ các Tác giả",
		en: "Meet the Authors"
	},
	authors_desc: {
		vi: "Khám phá những kỹ sư, kiến trúc sư và tác giả chia sẻ kiến thức và kinh nghiệm thực chiến trên blog này.",
		en: "Discover the engineers, architects, and writers who share their technical knowledge and experience."
	},
	view_articles: {
		vi: "Xem các bài viết",
		en: "View Articles"
	},
	no_authors_alt: {
		vi: "Không tìm thấy tác giả nào.",
		en: "No authors found."
	},
	articles_written_by: {
		vi: "Các bài viết được viết bởi",
		en: "Articles written by"
	},
	views: {
		vi: "lượt xem",
		en: "views"
	},
	biography: {
		vi: "Tiểu sử",
		en: "Biography"
	},
	submit_feedback: {
		vi: "Gửi Phản Hồi",
		en: "Submit Feedback"
	},
	feedback_desc: {
		vi: "Ý kiến, đóng góp và đề xuất của bạn giúp chúng tôi cải thiện hệ thống. Hãy chia sẻ cảm nghĩ của bạn!",
		en: "Your opinions, criticisms, and suggestions help us build a better platform. Tell us what you think!"
	},
	overall_rating: {
		vi: "Đánh giá chung",
		en: "Overall Rating"
	},
	your_name: {
		vi: "Họ và Tên",
		en: "Your Name"
	},
	email_address: {
		vi: "Địa chỉ Email",
		en: "Email Address"
	},
	subject_optional: {
		vi: "Tiêu đề (Không bắt buộc)",
		en: "Subject (Optional)"
	},
	your_feedback_msg: {
		vi: "Nội dung phản hồi / Góp ý",
		en: "Your Feedback / Message"
	},
	send_feedback: {
		vi: "Gửi Góp Ý",
		en: "Send Feedback"
	},
	feedback_success: {
		vi: "Đã gửi góp ý thành công!",
		en: "Feedback sent successfully!"
	},
	feedback_success_desc: {
		vi: "Chúng tôi ghi nhận ý kiến của bạn để cải thiện trang web tốt hơn. Xin cảm ơn!",
		en: "We appreciate your input and will use it to improve our blog. Thank you!"
	},
	posts_management: {
		vi: "Quản Lý Bài Viết",
		en: "Posts Management"
	},
	posts_management_desc: {
		vi: "Tạo, chỉnh sửa, phân loại và quản lý các bài đăng của bạn.",
		en: "Create, edit, categorize and manage all your posts."
	},
	admin_posts_title: {
		vi: "Quản Lý Bài Viết",
		en: "Manage Articles"
	},
	admin_posts_subtitle: {
		vi: "Tạo, sửa và tổ chức các bài viết kỹ thuật của bạn.",
		en: "Create, edit, and organize your technical articles."
	},
	create_new_post: {
		vi: "Viết Bài Mới",
		en: "Create New Post"
	},
	table_title: {
		vi: "Tiêu đề",
		en: "Title"
	},
	table_author: {
		vi: "Tác giả",
		en: "Author"
	},
	table_category: {
		vi: "Danh mục",
		en: "Category"
	},
	table_status: {
		vi: "Trạng thái",
		en: "Status"
	},
	table_actions: {
		vi: "Thao tác",
		en: "Actions"
	},
	filter_all: {
		vi: "Tất cả trạng thái",
		en: "All Statuses"
	},
	filter_published: {
		vi: "Đã xuất bản",
		en: "Published"
	},
	filter_draft: {
		vi: "Bản nháp",
		en: "Draft"
	},
	bulk_action: {
		vi: "Thao tác hàng loạt",
		en: "Bulk Actions"
	},
	bulk_publish: {
		vi: "Xuất bản đã chọn",
		en: "Publish Selected"
	},
	bulk_draft: {
		vi: "Chuyển thành bản nháp",
		en: "Draft Selected"
	},
	bulk_delete: {
		vi: "Xóa đã chọn",
		en: "Delete Selected"
	},
	search_posts_placeholder: {
		vi: "Tìm bài viết theo tiêu đề...",
		en: "Search posts by title..."
	},
	delete_confirm_title: {
		vi: "Xóa bài viết",
		en: "Delete Article"
	},
	delete_confirm_msg: {
		vi: "Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.",
		en: "Are you sure you want to delete this article? This action cannot be undone."
	},
	show_deleted: {
		vi: "Hiển thị đã xóa",
		en: "Show Deleted"
	},
	selected: {
		vi: "Đã chọn",
		en: "Selected"
	},
	clear: {
		vi: "Bỏ chọn",
		en: "Clear"
	},
	all_categories: {
		vi: "Tất cả chuyên mục",
		en: "All Categories"
	},
	all_tags: {
		vi: "Tất cả thẻ tag",
		en: "All Tags"
	},
	delete: {
		vi: "Xóa",
		en: "Delete"
	},
	force_delete: {
		vi: "Xóa vĩnh viễn",
		en: "Force Delete"
	},
	total: {
		vi: "Tổng số",
		en: "Total"
	},
	delete_permanent_title: {
		vi: "Xóa vĩnh viễn bài viết?",
		en: "Permanently Delete Article?"
	},
	delete_soft_title: {
		vi: "Xóa bài viết (Vào thùng rác)?",
		en: "Delete Article (Soft Delete)?"
	},
	delete_permanent_msg: {
		vi: "Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này? Hành động này hoàn toàn không thể khôi phục lại.",
		en: "Are you sure you want to permanently delete this article? This action is irreversible."
	},
	delete_soft_msg: {
		vi: "Bạn có chắc chắn muốn đưa bài viết này vào thùng rác? Bạn có thể khôi phục lại sau.",
		en: "Are you sure you want to delete this article? You can restore it later from the deleted view."
	},
	editor_create_title: {
		vi: "Tạo Bài Viết Mới",
		en: "Create New Post"
	},
	editor_edit_title: {
		vi: "Chỉnh Sửa Bài Viết",
		en: "Edit Post"
	},
	editor_title_label: {
		vi: "Tiêu đề bài viết",
		en: "Article Title"
	},
	editor_title_placeholder: {
		vi: "Nhập tiêu đề ấn tượng...",
		en: "Enter a catchy title..."
	},
	editor_slug_label: {
		vi: "Đường dẫn bài viết (Slug)",
		en: "Post URL Slug"
	},
	editor_content_label: {
		vi: "Nội dung bài viết",
		en: "Article Content"
	},
	editor_excerpt_label: {
		vi: "Tóm tắt bài viết",
		en: "Excerpt / Summary"
	},
	editor_excerpt_placeholder: {
		vi: "Viết tóm tắt ngắn cho bài viết hiển thị ở trang chủ...",
		en: "Write a short summary for the home page..."
	},
	editor_cover_label: {
		vi: "Ảnh bìa bài viết",
		en: "Cover Image"
	},
	editor_select_cover: {
		vi: "Chọn ảnh bìa",
		en: "Select Cover Image"
	},
	editor_change_cover: {
		vi: "Thay đổi ảnh bìa",
		en: "Change Cover Image"
	},
	editor_meta_title: {
		vi: "Tiêu đề Meta (SEO)",
		en: "Meta Title (SEO)"
	},
	editor_meta_desc: {
		vi: "Mô tả Meta (SEO)",
		en: "Meta Description (SEO)"
	},
	editor_categories_label: {
		vi: "Danh mục chuyên mục",
		en: "Categories"
	},
	editor_tags_label: {
		vi: "Thẻ tag",
		en: "Tags"
	},
	editor_tags_placeholder: {
		vi: "Nhập thẻ tag và nhấn Enter...",
		en: "Type tag and press Enter..."
	},
	editor_save: {
		vi: "Lưu bài viết",
		en: "Save Post"
	},
	editor_cancel: {
		vi: "Hủy bỏ",
		en: "Cancel"
	},
	editor_status_label: {
		vi: "Trạng thái xuất bản",
		en: "Publish Status"
	},
	editor_schedule_label: {
		vi: "Ngày giờ xuất bản (Lên lịch)",
		en: "Publish Date & Time (Schedule)"
	},
	editor_schedule_help: {
		vi: "Thiết lập ngày tương lai để lên lịch, hoặc để trống để xuất bản ngay.",
		en: "Set a future date to schedule publication, or leave blank to publish immediately."
	},
	editor_featured_label: {
		vi: "Đánh dấu là bài viết nổi bật",
		en: "Mark as Featured Post"
	},
	category_name: {
		vi: "Tên chuyên mục",
		en: "Category Name"
	},
	parent_category: {
		vi: "Chuyên mục cha",
		en: "Parent Category"
	},
	description: {
		vi: "Mô tả",
		en: "Description"
	},
	actions: {
		vi: "Thao tác",
		en: "Actions"
	},
	create_category: {
		vi: "Tạo chuyên mục",
		en: "Create Category"
	},
	edit_category: {
		vi: "Sửa chuyên mục",
		en: "Edit Category"
	},
	tag_name: {
		vi: "Tên thẻ tag",
		en: "Tag Name"
	},
	create_tag: {
		vi: "Tạo thẻ tag",
		en: "Create Tag"
	},
	active_tags: {
		vi: "Các thẻ tag hoạt động",
		en: "Active Tags"
	},
	deleted_tags: {
		vi: "Các thẻ tag đã xóa",
		en: "Deleted Tags"
	},
	save_changes: {
		vi: "Lưu thay đổi",
		en: "Save Changes"
	},
	cancel: {
		vi: "Hủy bỏ",
		en: "Cancel"
	},
	back: {
		vi: "Quay lại",
		en: "Back"
	},
	editor_title_vi: {
		vi: "Tiêu đề bài viết (VI)",
		en: "Article Title (VI)"
	},
	editor_title_en: {
		vi: "Tiêu đề bài viết (EN)",
		en: "Article Title (EN)"
	},
	editor_slug_vi: {
		vi: "Đường dẫn Slug VI",
		en: "Post URL Slug VI"
	},
	editor_slug_en: {
		vi: "Đường dẫn Slug EN",
		en: "Post URL Slug EN"
	},
	editor_excerpt_vi: {
		vi: "Tóm tắt ngắn (VI)",
		en: "Short Excerpt (VI)"
	},
	editor_excerpt_en: {
		vi: "Tóm tắt ngắn (EN)",
		en: "Short Excerpt (EN)"
	},
	editor_content_vi: {
		vi: "Nội dung bài viết (VI)",
		en: "Article Content (VI)"
	},
	editor_content_en: {
		vi: "Nội dung bài viết (EN)",
		en: "Article Content (EN)"
	},
	editor_auto_translate: {
		vi: "🌐 Dịch tự động từ Tiếng Việt",
		en: "🌐 Auto-translate from Vietnamese"
	},
	editor_translating: {
		vi: "Đang dịch...",
		en: "Translating..."
	},
	editor_translate_success: {
		vi: "Đã dịch tự động sang Tiếng Anh thành công!",
		en: "Auto-translated to English successfully!"
	},
	editor_translate_error: {
		vi: "Gặp lỗi khi dịch tự động: ",
		en: "Error during auto-translation: "
	},
	editor_vietnamese_tab: {
		vi: "Tiếng Việt (Bản chính)",
		en: "Vietnamese (Main)"
	},
	editor_english_tab: {
		vi: "Tiếng Anh (Bản dịch)",
		en: "English (Translation)"
	},
	editor_seo_title: {
		vi: "Cấu hình SEO Metadata",
		en: "SEO Metadata Config"
	},
	editor_google_preview: {
		vi: "Xem trước kết quả Google",
		en: "Google Search Preview"
	},
	editor_publish_settings: {
		vi: "Thiết lập xuất bản",
		en: "Publish Settings"
	},
	editor_is_pdf: {
		vi: "Bài viết dạng tài liệu PDF",
		en: "Is PDF Document Post"
	},
	editor_pdf_attached: {
		vi: "File PDF đính kèm",
		en: "Attached PDF File"
	},
	editor_select_pdf: {
		vi: "Chọn file PDF",
		en: "Select PDF File"
	},
	editor_pick_cover: {
		vi: "Chọn ảnh bìa",
		en: "Pick Cover Image"
	},
	editor_remove_cover: {
		vi: "Xóa ảnh bìa",
		en: "Remove Cover Image"
	},
	editor_taxonomy: {
		vi: "Phân loại",
		en: "Taxonomy"
	}
};
var LanguageContext = createContext(void 0);
var LanguageProvider = ({ children }) => {
	const rootData = useRouteLoaderData("root");
	const [language, setLanguageState] = useState(() => rootData?.language || "vi");
	useEffect(() => {
		if (rootData?.language) setLanguageState(rootData.language);
	}, [rootData?.language]);
	const setLanguage = (lang) => {
		setLanguageState(lang);
		setCookie("language", lang, 365);
	};
	const t = (key) => {
		const translation = dictionary[key];
		if (!translation) return key;
		return translation[language] || key;
	};
	return /* @__PURE__ */ jsx(LanguageContext.Provider, {
		value: {
			language,
			setLanguage,
			t
		},
		children
	});
};
var useLanguage = () => {
	const context = useContext(LanguageContext);
	if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
	return context;
};
//#endregion
export { useLanguage as n, LanguageProvider as t };
