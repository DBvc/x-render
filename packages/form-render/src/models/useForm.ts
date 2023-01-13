import { useRef } from 'react';
import { Form, FormInstance } from 'antd';
import { transformFieldsError, getSchemaFullPath } from './formCoreUtils';
import { transformValueBind, parseValuesWithBind } from './bindValues';
import { _set, _get, _has, _cloneDeep, _merge, isFunction, isObject } from '../utils';


interface FormInstanceExtends extends FormInstance {
  init: any;
  schema: any;
  _getStoreState: () => any;
  /** 设置表单值 */
  setValues: FormInstance['setFieldsValue'];
  setSchemaByFullPath: (path: string, schema: any) => any;
  /** 根据路径动态设置 Schema */
  setSchemaByPath: (path: string, schema: any) => any;
  getHiddenValues: () => any;
  /** 获取表单值 */
  getValues: FormInstance['getFieldsValue'];
  /** 设置 Schema */
  setSchema: (schema: any) => void;
  resetSchema: (schema: any) => void;
  /** 根据路径修改表单值 */
  setValueByPath: FormInstance['setFieldValue'];
  /**
   * @deprecated 即将弃用，请勿使用此api，使用setValueByPath
   */
  onItemChange: FormInstance['setFieldValue'];
  /** 根据路径获取 Schema */
  getSchemaByPath: (path: string) => any;
  setErrorFields: (erros: any[]) => void;
  removeErrorField: (path: string) => any;
  errorFields: FormInstance['getFieldsError'];
  /**
   * @deprecated 即将弃用，请勿使用此api，使用 form.isFieldsValidating
   */
  scrollToPath: FormInstance['scrollToField']
};

const updateSchemaByPath = (_path: string, _newSchema: any, formSchema: any) => {
  const path = getSchemaFullPath(_path, formSchema);
  const currSchema = _get(formSchema, path, {});
  const newSchema = isFunction(_newSchema) ? _newSchema(currSchema) : _newSchema;

  const result = _merge(currSchema, newSchema);
  _set(formSchema, path, result);
};

const useForm = () => {
  const [form] = Form.useForm() as [FormInstanceExtends];
  const formStoreRef: any = useRef();

  /**初始化 */
  form.init = (storeData: any, useStore: any) => {
    debugger;
    const { getState } = useStore;
    debugger;
    const { init, isInit } = getState();
    if (isInit) {
      return;
    }
    formStoreRef.current = { getState };
    init(storeData);
    form.schema = Object.freeze(storeData?.schema);
  };

  form.resetSchema = schema => {
    try {
      const { setSchema } = formStoreRef.current.getState();
      setSchema(schema);
      form.schema = Object.freeze(schema);
    } catch (error) {
    }
  }

  form.setSchema = (obj: any) => {
    try {
      if (!isObject(obj)) {
        return;
      }
      const { schema, setSchema } = formStoreRef.current.getState();
      Object.keys(obj || {}).forEach(path => {
        updateSchemaByPath(path, obj[path], schema);
      });
  
      setSchema(schema);
      form.schema = Object.freeze(schema);
      
    } catch (error) {
    }
  }

  form.setSchemaByPath = (_path: string, _newSchema: any) => {
    try {
      const { schema, setSchema } = formStoreRef.current.getState();
      updateSchemaByPath(_path, _newSchema, schema);
      setSchema(schema);
      form.schema = Object.freeze(schema);
    } catch (error) {
      
    }
  }

  form.setSchemaByFullPath = (path: string, newSchema: any) => {
    try {
      const { schema, setSchema } = formStoreRef.current.getState();
      const currSchema = _get(schema, path, {});
      const result = _merge(newSchema, currSchema);

      _set(schema, path, result);
      setSchema(schema);
      form.schema = Object.freeze(schema);
    } catch (error) {
      
    }
  }

  form.setValues = (_values: any) => {
    try {
      const { flattenSchema } = formStoreRef.current.getState();
      const values = transformValueBind(_values, flattenSchema);
      form.setFieldsValue(values);
    } catch (error) {
      form.setFieldsValue(_values);
    }
  }

  form.getValues = (nameList?: any, filterFunc?: any) => {
    try {
      const { flattenSchema } = formStoreRef.current.getState();
      const values = form.getFieldsValue(nameList, filterFunc);
      return parseValuesWithBind(values, flattenSchema);
    } catch (error) {
      return {}
    }
  }

  form.setValueByPath = form.setFieldValue;

  form.getSchemaByPath = _path => {
    if (typeof _path !== 'string') {
      console.warn('请输入正确的路径');
    }
    const path = getSchemaFullPath(_path, form.schema);
    return _get(form.schema, path);
  };

  form.setErrorFields = (_fieldsError: any[]) => {
    const fieldsError = transformFieldsError(_fieldsError);
    if (!fieldsError) {
      return;
    }
    form.setFields(fieldsError);
  };

  form.removeErrorField = (path: any) => {
    form.setFields([{ name: path, errors: []}]);
  };

  // 老 API 兼容
  form.scrollToPath = form.scrollToField;
  form.onItemChange = form.setFieldValue;
  // form = {
  //   // touchedKeys: _touchedKeys.current,
  //   // allTouched,
  //   // methods
  //   // touchKey,
  //   // removeTouched,
  //   // changeTouchedKeys,
  // };
  return form;
};

export default useForm ;
