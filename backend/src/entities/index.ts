import { User } from './User';
import { Category } from './Category';
import { Transaction } from './Transaction';
import { CustomRecap } from './CustomRecap';
import { Wallet } from './wallet';
import { MonthlyReport } from './MonthlyReport';
import { Transfer } from './Transfer';

const entities = [
    User, 
    Category,
    Transaction, 
    CustomRecap,
    Wallet,
    MonthlyReport,
    Transfer
];

export { 
    User, 
    Category,
    Transaction, 
    CustomRecap,
    Wallet,
    MonthlyReport,
    Transfer,
    entities 
};

