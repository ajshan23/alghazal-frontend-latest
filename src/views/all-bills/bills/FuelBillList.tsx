import AdaptableCard from '@/components/shared/AdaptableCard'
import BillTable from './components/BillTables'
import BillTableTools from './components/BillTableTools'




const FuelBillList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Fuel Bills</h3>
<BillTableTools to="/app/new-fuel-bill" title="Add Bill" />
            </div>
            <BillTable />
        </AdaptableCard>
    )
}

export default FuelBillList
