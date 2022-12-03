"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerPool = void 0;
var worker_threads_1 = require("worker_threads");
var taskId = 0;
var resolvers = { 0: function () { } };
var WorkerPool = /** @class */ (function () {
    function WorkerPool(number) {
        var _this = this;
        this.workers = [];
        var _loop_1 = function (i) {
            var worker = new worker_threads_1.Worker(__dirname + '/worker.js');
            var workerItem = { id: i, worker: worker, queue: [] };
            this_1.workers.push(workerItem);
            worker.on('message', function (value) { return _this.onMessage(workerItem.id, value); });
        };
        var this_1 = this;
        for (var i = 0; i < number; i++) {
            _loop_1(i);
        }
    }
    WorkerPool.prototype.onMessage = function (workerId, value) {
        if (!value.taskId)
            return;
        // console.log(value);
        var id = value.taskId;
        delete value.taskId;
        resolvers[id](value);
        delete resolvers[id];
        if (this.workers[workerId].queue.length > 0) {
            this.setWorkerTimeout(workerId);
        }
    };
    WorkerPool.prototype.work = function (data) {
        var _a;
        (_a = data.expiresAt) !== null && _a !== void 0 ? _a : (data.expiresAt = new Date().getTime() + 20000);
        data.taskId = ++taskId;
        // Assign the task to the worker with minimum queue length
        var minLength = Infinity;
        var workerId = -1;
        for (var i = 0; i < this.workers.length; i++) {
            var queueLength = this.workers[i].queue.length;
            if (queueLength < minLength) {
                minLength = queueLength;
                workerId = i;
            }
            if (minLength === 0)
                break;
        }
        var worker = this.workers[workerId];
        worker.queue.push(data);
        if (worker.queue.length === 1)
            this.setWorkerTimeout(workerId);
        worker.worker.postMessage(data);
        return new Promise(function (resolve) {
            resolvers[taskId] = function (value) {
                worker.queue.splice(0, 1);
                resolve(value);
            };
        });
    };
    WorkerPool.prototype.setWorkerTimeout = function (workerId) {
        var _this = this;
        var _a, _b;
        var worker = this.workers[workerId];
        var id = (_b = (_a = worker.queue[0]) === null || _a === void 0 ? void 0 : _a.taskId) !== null && _b !== void 0 ? _b : 0;
        setTimeout(function () {
            var _a;
            if (((_a = worker.queue[0]) === null || _a === void 0 ? void 0 : _a.taskId) === id) {
                worker.worker.terminate();
                resolvers[id]({
                    html: '',
                    data: '',
                    errors: ['TIMEOUT'],
                    warnings: [],
                });
                delete resolvers[id];
                worker.worker = new worker_threads_1.Worker(__dirname + '/worker.js');
                worker.worker.on('message', function (value) { return _this.onMessage(worker.id, value); });
                if (worker.queue.length > 0)
                    _this.setWorkerTimeout(workerId);
                for (var _i = 0, _b = worker.queue; _i < _b.length; _i++) {
                    var data = _b[_i];
                    worker.worker.postMessage(data);
                }
                console.log("[".concat(getTimestamp(), "] #").concat(id, " Timeout."));
            }
        }, 20000);
        function getTimestamp() {
            return new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
    };
    return WorkerPool;
}());
exports.WorkerPool = WorkerPool;
//# sourceMappingURL=WorkerPool.js.map