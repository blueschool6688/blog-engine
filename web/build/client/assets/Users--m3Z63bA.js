import { c as getFullUrl, g as userService } from "./api-DYEteWSp.js";
import { n as useAuth } from "./AuthContext-DKglX8kS.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { UNSAFE_withComponentProps } from "react-router";
import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertOctagon, Edit2, Lock, Mail, Plus, Shield, User } from "lucide-react";
import { Avatar, Button, Form, Input, Modal, Select, Switch, Table, Tag as Tag$1, Tooltip } from "antd";
//#region src/pages/Users.tsx
async function loader() {
	return null;
}
var Users$1 = () => {
	const { user: currentUser } = useAuth();
	const { showSuccess, showError } = useToast();
	const [users, setUsers] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [roleFilter, setRoleFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const limit = 10;
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [modalLoading, setModalLoading] = useState(false);
	const [form] = Form.useForm();
	const fetchUsers = async () => {
		setLoading(true);
		try {
			const offset = (currentPage - 1) * limit;
			const res = await userService.list(offset, limit, roleFilter);
			if (res.success && res.data) {
				setUsers(res.data.items || []);
				setTotal(res.data.total || 0);
			}
		} catch (err) {
			console.error(err);
			showError("Failed to retrieve user list");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchUsers();
	}, [roleFilter, currentPage]);
	if (currentUser?.role !== "admin") return /* @__PURE__ */ jsxs("div", {
		className: "py-16 text-center max-w-md mx-auto space-y-4",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "w-16 h-16 bg-dangerRed/10 border border-dangerRed/25 rounded-full flex items-center justify-center mx-auto text-dangerRed animate-pulse",
				children: /* @__PURE__ */ jsx(AlertOctagon, { className: "w-8 h-8" })
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "text-xl font-bold text-gray-100",
				children: "Access Denied"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-500 font-sans leading-relaxed",
				children: "You do not have administrative privileges to access user account management. Please contact your system administrator."
			})
		]
	});
	const openCreateModal = () => {
		setEditingUser(null);
		form.resetFields();
		setIsModalOpen(true);
	};
	const openEditModal = (user) => {
		setEditingUser(user);
		form.setFieldsValue({
			name: user.name,
			nickname: user.nickname || "",
			email: user.email,
			role: user.role,
			is_active: user.is_active
		});
		setIsModalOpen(true);
	};
	const handleModalSubmit = async (values) => {
		setModalLoading(true);
		try {
			if (editingUser) {
				await userService.update(editingUser.id, {
					name: values.name,
					nickname: values.nickname,
					role: values.role,
					is_active: values.is_active
				});
				showSuccess("User account updated successfully");
			} else {
				await userService.create({
					name: values.name,
					nickname: values.nickname,
					email: values.email,
					password: values.password,
					role: values.role
				});
				showSuccess("New user account created successfully");
			}
			setIsModalOpen(false);
			fetchUsers();
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to save user account");
		} finally {
			setModalLoading(false);
		}
	};
	const toggleUserStatus = async (user, checked) => {
		try {
			await userService.update(user.id, {
				name: user.name,
				nickname: user.nickname || "",
				role: user.role,
				is_active: checked
			});
			showSuccess(`Successfully ${checked ? "activated" : "deactivated"} user ${user.name}`);
			setUsers((prev) => prev.map((u) => u.id === user.id ? {
				...u,
				is_active: checked
			} : u));
		} catch (err) {
			console.error(err);
			showError("Failed to change user status");
		}
	};
	const getInitial = (name) => {
		return name ? name.charAt(0).toUpperCase() : "?";
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight",
					children: "Member Management"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-gray-500 mt-1",
					children: "Manage system administrators, editors, and nickname handles"
				})] }), /* @__PURE__ */ jsx(Button, {
					type: "primary",
					onClick: openCreateModal,
					icon: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
					className: "bg-btn-global hover:brightness-110 border-0 h-10 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accentBlue/10",
					children: "Add New Member"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-900/30 p-4 space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex justify-between items-center select-none pb-2",
					children: [/* @__PURE__ */ jsx(Select, {
						value: roleFilter,
						onChange: (val) => {
							setRoleFilter(val);
							setCurrentPage(1);
						},
						options: [
							{
								label: "All Roles",
								value: ""
							},
							{
								label: "Admin",
								value: "admin"
							},
							{
								label: "Editor",
								value: "editor"
							}
						],
						className: "w-40 h-9"
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-xs text-gray-500 font-mono",
						children: ["Total Members: ", total]
					})]
				}), /* @__PURE__ */ jsx(Table, {
					columns: [
						{
							title: "Member",
							dataIndex: "name",
							key: "name",
							render: (_, record) => /* @__PURE__ */ jsxs("div", {
								className: "flex items-center space-x-3 select-none",
								children: [/* @__PURE__ */ jsx(Avatar, {
									src: record.avatar_url ? getFullUrl(record.avatar_url) : void 0,
									className: "bg-slate-800 text-white font-extrabold flex items-center justify-center shrink-0 border border-slate-700 w-9 h-9",
									children: getInitial(record.name)
								}), /* @__PURE__ */ jsxs("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-bold text-sm text-slate-850 dark:text-gray-255 block truncate",
										children: record.name
									}), /* @__PURE__ */ jsxs("span", {
										className: "text-xs text-gray-500 block truncate font-semibold",
										children: [
											"@",
											record.nickname || "no-nick",
											record.id === currentUser.id && /* @__PURE__ */ jsx("span", {
												className: "ml-1 text-[9px] font-black text-accentPurple uppercase tracking-wider",
												children: "(You)"
											})
										]
									})]
								})]
							})
						},
						{
							title: "Email Address",
							dataIndex: "email",
							key: "email",
							render: (text) => /* @__PURE__ */ jsx("span", {
								className: "text-xs text-gray-400 font-medium",
								children: text
							})
						},
						{
							title: "Role",
							dataIndex: "role",
							key: "role",
							width: 140,
							render: (role) => {
								const isAdmin = role === "admin";
								return /* @__PURE__ */ jsx(Tag$1, {
									color: isAdmin ? "blue" : "orange",
									className: "rounded-lg border-0 uppercase font-black tracking-wider text-[9px] px-2.5 py-0.5",
									children: /* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1",
										children: [isAdmin && /* @__PURE__ */ jsx(Shield, { className: "w-2.5 h-2.5" }), isAdmin ? "Admin" : "Editor"]
									})
								});
							}
						},
						{
							title: "Status",
							dataIndex: "is_active",
							key: "is_active",
							width: 140,
							render: (isActive, record) => /* @__PURE__ */ jsx(Tooltip, {
								title: record.id === currentUser.id ? "Cannot deactivate yourself" : "Toggle active status",
								children: /* @__PURE__ */ jsx(Switch, {
									checked: isActive,
									disabled: record.id === currentUser.id,
									onChange: (checked) => toggleUserStatus(record, checked),
									size: "small"
								})
							})
						},
						{
							title: "Actions",
							key: "actions",
							width: 100,
							align: "right",
							render: (_, record) => /* @__PURE__ */ jsx(Tooltip, {
								title: "Edit Member Info",
								children: /* @__PURE__ */ jsx(Button, {
									type: "text",
									icon: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" }),
									onClick: () => openEditModal(record),
									className: "bg-slate-800 hover:bg-slate-700/85 text-gray-300 flex items-center justify-center p-2 rounded-lg border border-slate-750"
								})
							})
						}
					],
					dataSource: users,
					rowKey: "id",
					loading,
					pagination: {
						current: currentPage,
						pageSize: limit,
						total,
						onChange: (page) => setCurrentPage(page),
						showSizeChanger: false,
						className: "select-none"
					},
					className: "border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden bg-transparent"
				})]
			}),
			/* @__PURE__ */ jsx(Modal, {
				title: /* @__PURE__ */ jsx("span", {
					className: "font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2 select-none",
					children: editingUser ? "Edit Member Profile" : "Add New System Member"
				}),
				open: isModalOpen,
				onOk: () => form.submit(),
				onCancel: () => setIsModalOpen(false),
				confirmLoading: modalLoading,
				okText: editingUser ? "Save Changes" : "Create Account",
				cancelText: "Cancel",
				okButtonProps: { className: "rounded-xl font-bold h-9 bg-btn-global border-0 hover:brightness-105" },
				cancelButtonProps: { className: "rounded-xl font-bold h-9" },
				destroyOnClose: true,
				className: "select-none",
				children: /* @__PURE__ */ jsxs(Form, {
					form,
					layout: "vertical",
					onFinish: handleModalSubmit,
					initialValues: {
						role: "editor",
						is_active: true
					},
					requiredMark: false,
					className: "pt-4 space-y-3",
					children: [
						/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "Display Name"
							}),
							name: "name",
							rules: [{
								required: true,
								message: "Please input display name!"
							}],
							children: /* @__PURE__ */ jsx(Input, {
								prefix: /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-gray-500 mr-1 shrink-0" }),
								placeholder: "e.g. John Doe",
								className: "h-10 rounded-xl"
							})
						}),
						/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "Nickname (Required, lowercase without space)"
							}),
							name: "nickname",
							rules: [{
								required: true,
								message: "Please input nickname handle!"
							}, {
								pattern: /^[a-z0-9_.-]+$/,
								message: "Nickname must be lowercase alphanumeric, dashes, dots, or underscores only."
							}],
							children: /* @__PURE__ */ jsx(Input, {
								prefix: /* @__PURE__ */ jsx("span", {
									className: "text-xs text-gray-500 font-bold mr-1 shrink-0",
									children: "@"
								}),
								placeholder: "e.g. johndoe",
								className: "h-10 rounded-xl"
							})
						}),
						!editingUser && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "Email Address"
							}),
							name: "email",
							rules: [{
								required: true,
								message: "Please input email!"
							}, {
								type: "email",
								message: "Please input a valid email!"
							}],
							children: /* @__PURE__ */ jsx(Input, {
								prefix: /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 text-gray-500 mr-1 shrink-0" }),
								placeholder: "name@example.com",
								className: "h-10 rounded-xl"
							})
						}), /* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "Password"
							}),
							name: "password",
							rules: [{
								required: true,
								message: "Please input password!"
							}, {
								min: 6,
								message: "Password must be at least 6 characters!"
							}],
							children: /* @__PURE__ */ jsx(Input.Password, {
								prefix: /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-gray-500 mr-1 shrink-0" }),
								placeholder: "Min 6 characters...",
								className: "h-10 rounded-xl"
							})
						})] }),
						/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "System Role"
							}),
							name: "role",
							rules: [{ required: true }],
							children: /* @__PURE__ */ jsxs(Select, {
								className: "h-10",
								children: [/* @__PURE__ */ jsx(Select.Option, {
									value: "admin",
									children: "System Administrator"
								}), /* @__PURE__ */ jsx(Select.Option, {
									value: "editor",
									children: "Content Editor"
								})]
							})
						}),
						editingUser && /* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "Account Active"
							}),
							name: "is_active",
							valuePropName: "checked",
							children: /* @__PURE__ */ jsx(Switch, { size: "small" })
						})
					]
				})
			})
		]
	});
};
var Users_default = UNSAFE_withComponentProps(Users$1);
//#endregion
export { Users_default as default, loader };
