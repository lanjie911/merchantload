let mysql = require('mysql');

// 创建 mysql 连接池资源
let pool = mysql.createPool({
    host: '192.168.223.129',
    user: 'nodeuser',
    password: 'nodeuser123!',
    database: 'daichao'
});

exports.query = function (sql, arr, callback) {
    //建立链接
    pool.getConnection(function (err, connection) {
        if (err) { throw err; return; }
        connection.query(sql, arr, function (error, results, fields) {
            //将链接返回到连接池中，准备由其他人重复使用
            pool.releaseConnection(connection);
            if (error) throw error;
            //执行回调函数，将数据返回
            callback && callback(results, fields);
        });
    });
};

exports.insert = function (sql, arr, callback, errHandler) {
    //建立链接
    pool.getConnection(function (err, connection) {
        if (err) { throw err; return; }
        connection.query(sql, arr, function (error, results, fields) {
            //将链接返回到连接池中，准备由其他人重复使用
            pool.releaseConnection(connection);
            if (error) {
                if (errHandler) {
                    errHandler(error);
                    return;
                }
            } else {
                //执行回调函数，将数据返回
                callback && callback(results, fields);
            }
        });
    });
};

exports.execute = function (sql, param, callback) {
    let exeResult = {};
    exeResult.affectedRows = 0;

    pool.getConnection(
        function (fetch_err, connection) {
            if (fetch_err) {
                // 没拿到连接，直接返回
                throw fetch_err;
                return;
            }
            console.info("[SQL Fetch Connection]...OK");

            connection.beginTransaction(function (trans_err) {

                if (trans_err) {
                    // 打开事务失败，直接释放连接
                    pool.releaseConnection(connection);
                    throw trans_err;
                    return;
                }

                console.info("[SQL Trans Begin]...OK");

                connection.query(sql, param, function (exec_err, results, fields) {
                    if (exec_err) {
                        // 执行失败，回滚，释放连接
                        connection.rollback(function (roll_err) {
                            // 回滚之后先释放连接
                            pool.releaseConnection(connection);
                            if (roll_err) {
                                throw roll_err;
                                return;
                            }
                        });
                        throw exec_err;
                        return;
                    }
                    console.info("[SQL Trans Begin]...OK");
                    console.info(results);
                    exeResult.affectedRows = results.affectedRows;

                    // 执行成功 提交事务
                    connection.commit(function (comm_err) {
                        // 提交失败
                        if (comm_err) {
                            connection.rollback(function (rollerr) {
                                if (rollerr) {
                                    pool.releaseConnection(connection);
                                    throw rollerr;
                                    return;
                                }
                            });
                            pool.releaseConnection(connection);
                            throw comm_err;
                            return;
                        }
                        console.info("[SQL Commit Begin]...OK");
                        pool.releaseConnection(connection);
                        callback && callback(exeResult);
                    });
                });
            });
        }
    );
}