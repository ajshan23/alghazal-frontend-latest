import AdaptableCard from '@/components/shared/AdaptableCard'
import BillTable from './components/BillTables'
import BillTableTools from './components/BillTableTools'




const AccBillList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Accommodation Bills</h3>
                <BillTableTools to="/app/new-acc-bill" title="Add Bill" />
            </div>
            <BillTable />
        </AdaptableCard>
    )
}

export default AccBillList
