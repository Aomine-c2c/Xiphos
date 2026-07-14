# IMAGE_IMPORT_DESCRIPTOR
	.section	.idata$2
	.global	_head_C__Users_armut_404_Xiphos_future_rust_ui_target_debug_deps_rustce0HIVW_advpack_dll_imports_lib
_head_C__Users_armut_404_Xiphos_future_rust_ui_target_debug_deps_rustce0HIVW_advpack_dll_imports_lib:
	.rva	hname	#Ptr to image import by name list
	#this should be the timestamp, but NT sometimes
	#doesn't load DLLs when this is set.
	.long	0	# loaded time
	.long	0	# Forwarder chain
	.rva	__C__Users_armut_404_Xiphos_future_rust_ui_target_debug_deps_rustce0HIVW_advpack_dll_imports_lib_iname	# imported dll's name
	.rva	fthunk	# pointer to firstthunk
#Stuff for compatibility
	.section	.idata$5
fthunk:
	.section	.idata$4
hname:
