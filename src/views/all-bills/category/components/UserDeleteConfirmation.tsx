import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialogDoc from '@/views/docs/SharedComponentsDoc/components/ConfirmDialogDoc'
import { useAppDispatch } from '@/store'
// import {
//     toggleDeleteConfirmation,
//     deleteProduct,
//     getProducts,
//     useAppDispatch,
//     useAppSelector,
// } from '../store'

const UserDeleteConfirmation = () => {
    const dispatch = useAppDispatch()
    // const dialogOpen = useAppSelector(
    //     (state) => state.salesProductList.data.deleteConfirmation,
    // )
    // const selectedProduct = useAppSelector(
    //     (state) => state.salesProductList.data.selectedProduct,
    // )
    // const tableData = useAppSelector(
    //     (state) => state.salesProductList.data.tableData,
    // )

    // const onDialogClose = () => {
    //     dispatch(toggleDeleteConfirmation(false))
    // }

    // const onDelete = async () => {
    //     dispatch(toggleDeleteConfirmation(false))
    //     const success = await deleteProduct({ id: selectedProduct })

    //     if (success) {
    //         dispatch(getProducts(tableData))
    //         toast.push(
    //             <Notification
    //                 title={'Successfuly Deleted'}
    //                 type="success"
    //                 duration={2500}
    //             >
    //                 Product successfuly deleted
    //             </Notification>,
    //             {
    //                 placement: 'top-center',
    //             },
    //         )
    //     }
    // }

    return (
        <ConfirmDialogDoc
            // isOpen={dialogOpen}
            type="danger"
            title="Delete product"
            confirmButtonColor="red-600"
            // onClose={onDialogClose}
            // onRequestClose={onDialogClose}
            // onCancel={onDialogClose}
            // onConfirm={onDelete}
        >
            <p>
                Are you sure you want to delete this product? All record related
                to this product will be deleted as well. This action cannot be
                undone.
            </p>
        </ConfirmDialogDoc>
    )
}

export default UserDeleteConfirmation
