import convert from 'xml-js'
import dotProp from 'dot-prop-immutable'
import { deepCopy } from './utils'

export class DataMapperBase {
	constructor(data) {
		this.data = data
		this.endData = {}
		this.mapping = {}
		this.star = true
	}

	run() {
		const eachRecursive = (obj, star = true) => {
			for (let k in obj) {
				let newKey = k
				if (this.star === true && star === true) {
					newKey = 'star:' + k
				}
				if (k.indexOf(':') > -1 || k.indexOf('_') > -1) {
					newKey = k
				} else if (k.indexOf('*') > -1) {
					newKey = k.replace('*', '')
					obj[newKey] = obj[k]
					delete obj[k]
				} else if (this.star && star === true) {
					obj[newKey] = obj[k]
					delete obj[k]
				}
				if (k.indexOf('_attributes') > -1) {
					obj[newKey] = eachRecursive(obj[newKey], false);
				} else if (k.indexOf('_text') > -1) {
					obj[k] = dotProp.get(this.data, obj[k])
				} else if (typeof obj[newKey] == 'object' && obj[newKey] !== null) {
					obj[newKey] = eachRecursive(obj[newKey])
				} else {
					let value = obj[newKey]
					if (typeof value === 'function') {
						obj[newKey] = value.call(this)
						obj[newKey] = eachRecursive(obj[newKey])
					} else if (obj[newKey] !== undefined) {
						let v = obj[newKey]
						obj[newKey] = dotProp.get(this.data, v, v)
					}
				}
			}
			return obj
		}
		const copy = deepCopy(this.mapping)
		this.endData = eachRecursive(copy)
		this.endData = this.envelope(this.endData)
	}

	toXml() {
		this.run()
		const listHandling = val => {
			return val.replace(/\$\d*/, '')
		}
		const options = {
			compact: true,
			ignoreComment: true,
			spaces: 4,
			elementNameFn: listHandling,
		}
		return convert.js2xml(this.endData, options)
	}

	toJson() {
		this.run()
		return this.endData
	}

	epochToDate(path) {
		const epoch = dotProp.get(this.data, path)
		return new Date(epoch * 1000)
	}

	envelope(data) {
		throw Error
	}

	onSuccess(data) {
		throw Error
	}
}

module.exports = DataMapperBase
