from database.database_helper import DatabaseHelper
from utils.string_utils import StringUtils


# TODO:
# 1. Should have a specific table for Account statement exception in case
# user POST duplicate account statment excel
#
# 2. Should have a DatabaseHelper.execute(query, value...) function

class AccountStatementDao(object):

    def createTable(self):
        query = '''CREATE TABLE IF NOT EXISTS `account_statement` (
                id                              BIGINT AUTO_INCREMENT primary key NOT NULL,
                excel_url                       VARCHAR(100),
                start_date                      DATETIME,
                end_date                        DATETIME,
                sales_revenue                   DECIMAL(10,2),
                income                          DECIMAL(10,2) DEFAULT 0,
                created_at                      DATETIME,
                updated_at                      DATETIME,
                user_id                         BIGINT
                );'''
        DatabaseHelper.execute(query)

    # --------------------------------------------------------------------------
    # Insert an Account Statement
    # NOTE: UpdatedAt always have the same value with createdAt for the first time.
    # --------------------------------------------------------------------------
    def insert(self, user, accountStatement):
        query = '''INSERT INTO `account_statement`(excel_url, start_date,
                            end_date, sales_revenue, income,
                            created_at, updated_at, user_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)'''
        conn = DatabaseHelper.getConnection()
        cur = conn.cursor()
        try:
            cur.execute(query, (accountStatement['excel_url'], accountStatement['start_date'],
                           accountStatement['end_date'],accountStatement['sales_revenue'],
                           accountStatement['income'], accountStatement['created_at'],
                           accountStatement['created_at'], user['id']))
            conn.commit()
            conn.close()
            return None
        except Exception as ex:
            conn.rollback()
            conn.close()
            return '''User: {}-{}, Insert-invoice: {}'''.format(user['username'], user['id'], str(ex))

    # --------------------------------------------------------------------------
    # Update an Account Statement
    # --------------------------------------------------------------------------
    def update(self, user, accountStatementId, income, updatedAt):
        query = ''' UPDATE account_statement
                    SET income = {}, updated_at = '{}'
                    WHERE user_id = {} AND id = {}
                '''.format(income, updatedAt, user['id'], accountStatementId)
        try:
            result, exception = DatabaseHelper.execute(query)
            return exception
        except Exception as ex:
            return ''' User {}-{}, Update-Account-Statement: {} '''.format(user['username'], user['id'], str(ex))

    # --------------------------------------------------------------------------
    # Get an Account Statement
    # --------------------------------------------------------------------------
    def getFirstAccountStatementForTest(self, user):
        query = ''' SELECT *
                    FROM account_statement
                    WHERE user_id = {}
                '''.format(user['id'])
        try:
            conn = DatabaseHelper.getConnection()
            cur = conn.cursor()
            cur.execute(query)

            row = cur.fetchone()
            if not row:
                conn.close()
                return '''User: {}-{}, Dont have any account statement data'''.format(user['username'], user['id'])

            result = {
                "id": row[0],
                "excel_url": row[1],
                "start_date": row[2],
                "end_date": row[3],
                "sales_revenue": row[4],
                "income": row[5],
                "created_at": row[6],
                "updated_at": row[7]
            }

            conn.close()
            return result
        except Exception as ex:
            return '''User: {}-{}, Get-Account-Statement: {}'''.format(user['username'], user['id'], str(ex))

    # --------------------------------------------------------------------------
    # Get account statement with inner join clause
    # --------------------------------------------------------------------------
    def getAll(self, user):
        query = ''' SELECT * FROM `account_statement` WHERE user_id = {}
                '''.format(user['id'])
        try:
            conn = DatabaseHelper.getConnection()
            cur = conn.cursor()
            cur.execute(query)

            rows = cur.fetchall()
            result = []
            for row in rows:
                result.append({
                    "id": row[0],
                    "excel_url": row[1],
                    "start_date": row[2],
                    "end_date": row[3],
                    "sales_revenue": row[4],
                    "income": row[5],
                    "created_at": row[6],
                    "updated_at": row[7]
                })
            conn.close()
            return result, None
        except Exception as ex:
            return None, '''User: {}-{}, Get-Account-Statement: {}'''.format(user['username'], user['id'], str(ex))


