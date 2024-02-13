frappe.StudyProgramEditor = class {
	constructor(wrapper, frm, disable, is_new) {
		this.frm = frm;
		this.wrapper = wrapper;
		this.disable = disable;
		let user_program = is_new ? new Array() : this.frm.doc.programs.map(a => a.program);
		this.multicheck = frappe.ui.form.make_control({
			parent: wrapper,
			df: {
				fieldname: "programs",
				fieldtype: "MultiCheck",
				select_all: true,
				columns: 3,
				get_data: () => {
					return frappe.xcall('frappe.core.doctype.user.user.get_all_programs').then(programs => {
						return programs.map(program => {
							return {
								label: __(program),
								value: program,
								checked: user_program.includes(program)
							};
						});
					});
				},
				on_change: () => {
					this.set_programs_in_table();
					this.frm.dirty();
				}
			},
			render_input: true
		});
	}
	show() {
		this.reset();
	}

	reset() {
		let user_programs = (this.frm.doc.programs || []).map(a => a.program);
		this.multicheck.selected_options = user_programs;
		this.multicheck.refresh_input();
	}
	set_programs_in_table() {
		let programs = this.frm.doc.programs || [];
		let checked_options = this.multicheck.get_checked_options();
		programs.map(program_doc => {
			if (!checked_options.includes(program_doc.program)) {
				frappe.model.clear_doc(program_doc.doctype, program_doc.name);
			}
		});
		checked_options.map(program => {
			if (!programs.find(d => d.program === program)) {
				let program_doc = frappe.model.add_child(this.frm.doc, "Has Program", "programs");
				program_doc.program = program;
			}
		});
	}
	get_programs() {
		return {
			checked_programs: this.multicheck.get_checked_options(),
			unchecked_programs: this.multicheck.get_unchecked_options()
		};
	}
};